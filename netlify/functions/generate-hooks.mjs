import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  buildHookSystemPrompt,
  buildHookUserPrompt,
  normalizeHookTexts,
  parseModelJson,
} from './lib/hookPrompt.mjs';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MODEL = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;

function anthropicErrorMessage(err) {
  if (err?.error?.message) return err.error.message;
  if (err?.message) return err.message;
  return 'Hook generation failed.';
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

function nextIdFromRows(rows) {
  if (!rows?.length) return 1;
  return Math.max(...rows.map((row) => row.id)) + 1;
}

async function findNextVerbatim(supabase) {
  const { data, error } = await supabase
    .from('verbatims')
    .select('id, text, status')
    .eq('status', 'not_started')
    .neq('text', '')
    .order('id')
    .limit(50);

  if (error) throw error;

  const verbatim = (data ?? []).find((row) => row.text?.trim());
  return verbatim ?? null;
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

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'videoplanner' },
    });

    const verbatim = await findNextVerbatim(supabase);
    if (!verbatim) {
      return jsonResponse(404, {
        error: 'No verbatims left to extract. Mark some as "Not started" or add new verbatims.',
      });
    }

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildHookSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildHookUserPrompt(verbatim.text),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock?.text) {
      return jsonResponse(502, { error: 'Empty response from model.' });
    }

    const parsed = parseModelJson(textBlock.text);
    const hookTexts = normalizeHookTexts(parsed);

    if (hookTexts.length === 0) {
      return jsonResponse(502, { error: 'Model returned no hooks.' });
    }

    const { data: existingHooks, error: hooksError } = await supabase
      .from('hooks')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (hooksError) throw hooksError;

    let nextId = nextIdFromRows(existingHooks);
    const rows = hookTexts.map((text) => {
      const row = { id: nextId, text, verbatim_id: verbatim.id };
      nextId += 1;
      return row;
    });

    const { data: insertedHooks, error: insertError } = await supabase
      .from('hooks')
      .upsert(rows)
      .select();

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('verbatims')
      .update({ status: 'extracted' })
      .eq('id', verbatim.id);

    if (updateError) throw updateError;

    return jsonResponse(200, {
      verbatimId: verbatim.id,
      verbatimText: verbatim.text,
      hooks: (insertedHooks ?? []).map((row) => ({
        id: row.id,
        text: row.text,
        verbatimId: row.verbatim_id,
      })),
    });
  } catch (err) {
    console.error('generate-hooks error:', err);
    return jsonResponse(anthropicErrorStatus(err), {
      error: anthropicErrorMessage(err),
    });
  }
};
