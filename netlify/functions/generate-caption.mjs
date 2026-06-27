import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseModelJson,
} from './lib/captionPrompt.mjs';
import {
  assembleCaption,
  buildHashtagPool,
  validateHashtags,
} from './lib/hashtagFilter.mjs';

const MODEL = 'claude-sonnet-4-20250514';

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

function normalizeCaptionStyle(row) {
  return {
    id: row.id,
    style: row.style ?? '',
    hookSignals: row.hook_signals ?? row.hookSignals ?? '',
    structure: row.structure ?? '',
    guide: row.guide ?? '',
    example: row.example ?? '',
    maxChars: row.max_chars ?? row.maxChars ?? null,
  };
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

async function loadResources(supabase) {
  const [captionsRes, hashtagsRes] = await Promise.all([
    supabase.from('captions').select('*').order('id'),
    supabase.from('hashtags').select('*').order('id'),
  ]);

  if (captionsRes.error) throw captionsRes.error;
  if (hashtagsRes.error) throw hashtagsRes.error;

  return {
    styles: (captionsRes.data ?? []).map(normalizeCaptionStyle),
    hashtags: (hashtagsRes.data ?? []).map(normalizeHashtag),
  };
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

  const hook = body.hook?.trim();
  const goalName = body.goalName?.trim();
  const ctaText = body.ctaText?.trim() ?? '';
  const screens = Array.isArray(body.screens) ? body.screens : [];
  const captionStyle = body.captionStyle?.trim() || 'intelligent';
  const customInstruction = body.customInstruction?.trim() ?? '';

  if (!hook) {
    return jsonResponse(400, { error: 'hook is required.' });
  }
  if (!goalName) {
    return jsonResponse(400, { error: 'goalName is required.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'videoplanner' },
    });

    const { styles, hashtags } = await loadResources(supabase);

    if (styles.length === 0) {
      return jsonResponse(500, { error: 'No caption styles found in database.' });
    }

    if (captionStyle !== 'intelligent' && !styles.some((s) => s.style === captionStyle)) {
      return jsonResponse(400, { error: `Unknown caption style: ${captionStyle}` });
    }

    const hashtagPool = buildHashtagPool(hashtags, goalName, hook);

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt({
            hook,
            goalName,
            screens,
            ctaText,
            captionStyle,
            customInstruction,
            styles,
            hashtagPool,
          }),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock?.text) {
      return jsonResponse(502, { error: 'Empty response from model.' });
    }

    const parsed = parseModelJson(textBlock.text);
    const captionBody = String(parsed.captionBody ?? '').trim();
    const styleUsed = String(parsed.styleUsed ?? captionStyle).trim();

    if (!captionBody) {
      return jsonResponse(502, { error: 'Model returned empty caption.' });
    }

    let pickedHashtags = validateHashtags(parsed.hashtags, hashtagPool);

    if (pickedHashtags.length < 3) {
      const fallback = hashtagPool
        .filter((h) => h.category === 'medium' || h.category === 'niche')
        .slice(0, 4)
        .map((h) => h.hashtag);
      pickedHashtags = validateHashtags(
        [...pickedHashtags, ...fallback],
        hashtagPool
      );
    }

    pickedHashtags = pickedHashtags.slice(0, 4);

    const caption = assembleCaption(captionBody, pickedHashtags);

    return jsonResponse(200, {
      caption,
      captionBody,
      captionStyle: styleUsed,
      hashtagsUsed: pickedHashtags,
    });
  } catch (err) {
    console.error('generate-caption error:', err);
    return jsonResponse(500, {
      error: err.message ?? 'Caption generation failed.',
    });
  }
};
