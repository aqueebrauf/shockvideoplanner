const SMASH_CONTEXT = `Smash is a goal tracker app that helps people smash their biggest goals through daily check-ins, milestones, weekly reviews, and journaling. Core message: consistency beats motivation. Tone: direct, relatable, no corporate fluff.`;

export function buildHookSystemPrompt() {
  return `You extract short-form video HOOKS from customer research verbatims for Smash app marketing reels (Instagram, TikTok, YouTube Shorts).

${SMASH_CONTEXT}

A HOOK is the first 1–3 seconds of a reel — on-screen text or the spoken opening line. It must stop the scroll.

HOOK RULES:
1. Readable in 1–3 seconds (~5–15 words, never more than ~20).
2. Use the audience's own language — borrow phrases, rhythm, and sentiment from the verbatim.
3. Extremely catchy: instant comprehension, relatable "that's me" recognition, curiosity to watch the rest.
4. One verbatim may yield 1–5 hooks. Quality over quantity — do not force weak extras.
5. Each hook stands alone — no context from the verbatim needed.
6. No invented stats, user counts, or fake testimonials.
7. No hashtags, emojis, or quotation marks around the hook text.

Respond with valid JSON only (no markdown fences):
{
  "hooks": ["hook text 1", "hook text 2"]
}`;
}

export function buildHookUserPrompt(verbatimText) {
  return `Extract video hooks from this customer verbatim (a real comment from the target audience):

"""
${verbatimText.trim()}
"""

Return JSON with a "hooks" array of catchy opening lines derived from this verbatim.`;
}

export { parseModelJson } from './parseModelJson.mjs';

export function normalizeHookTexts(parsed) {
  const raw = Array.isArray(parsed?.hooks) ? parsed.hooks : [];
  const seen = new Set();
  const hooks = [];

  for (const item of raw) {
    const text = String(item ?? '').trim().replace(/^["']|["']$/g, '');
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    hooks.push(text);
  }

  return hooks;
}
