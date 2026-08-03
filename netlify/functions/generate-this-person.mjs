import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  buildHashtagPool,
  validateHashtags,
} from './lib/hashtagFilter.mjs';
import {
  buildThisPersonSystemPrompt,
  buildThisPersonUserPrompt,
  normalizeThisPersonEntries,
  parseModelJson,
} from './lib/thisPersonPrompt.mjs';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MODEL = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
const DEFAULT_COUNT = 3;

function anthropicErrorMessage(err) {
  if (err?.error?.message) return err.error.message;
  if (err?.message) return err.message;
  return 'This person generation failed.';
}

function anthropicErrorStatus(err) {
  const status = Number(err?.status ?? err?.response?.status);
  if (status >= 400 && status < 600) return status;
  return 500;
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

function normalizeHashtag(row) {
  return {
    id: row.id,
    hashtag: row.hashtag ?? '',
    posts: row.posts ?? null,
    category: row.category ?? 'broad',
    themes: Array.isArray(row.themes) ? row.themes : [],
  };
}

async function loadHashtags(supabase) {
  const { data, error } = await supabase.from('hashtags').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeHashtag);
}

function applyHashtagPool(entries, hashtagPool) {
  const poolTags = hashtagPool.map((h) => h.hashtag);

  return entries.map((entry) => {
    const rawTags = entry.hashtag
      .split(/\s+/)
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

    let validated = validateHashtags(rawTags, hashtagPool);

    if (validated.length === 0 && poolTags.length > 0) {
      validated = validateHashtags(
        buildHashtagPool(hashtagPool, '', entry.hookText)
          .slice(0, 3)
          .map((h) => h.hashtag),
        hashtagPool
      );
    }

    return {
      ...entry,
      hashtag: validated.slice(0, 3).join(' '),
    };
  });
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!apiKey) {
    return jsonResponse(500, { error: 'ANTHROPIC_API_KEY is not configured.' });
  }
  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse(500, { error: 'Supabase credentials are not configured.' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' });
  }

  const goalName = body.goalName?.trim();
  const hookText = body.hookText?.trim() ?? '';
  const customInstruction = body.customInstruction?.trim() ?? '';
  const count = hookText ? 1 : DEFAULT_COUNT;

  if (!goalName) {
    return jsonResponse(400, { error: 'goalName is required.' });
  }
  if (hookText.length > 60) {
    return jsonResponse(400, { error: 'Hook text must be 60 characters or fewer.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'videoplanner' },
    });

    const hashtags = await loadHashtags(supabase);
    const hashtagPool = buildHashtagPool(hashtags, goalName, hookText || goalName);

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: buildThisPersonSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildThisPersonUserPrompt({
            goalName,
            hookText,
            customInstruction,
            hashtagPool,
            count,
          }),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock?.text) {
      return jsonResponse(502, { error: 'Empty response from model.' });
    }

    const parsed = parseModelJson(textBlock.text);
    let entries = normalizeThisPersonEntries(parsed, { fixedHookText: hookText });

    if (entries.length === 0) {
      return jsonResponse(502, { error: 'Model returned no entries.' });
    }

    entries = applyHashtagPool(entries, hashtagPool);

    return jsonResponse(200, { entries });
  } catch (err) {
    console.error('generate-this-person error:', err);
    return jsonResponse(anthropicErrorStatus(err), {
      error: anthropicErrorMessage(err),
    });
  }
};
