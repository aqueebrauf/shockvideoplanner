const THIS_PERSON_HOOK_MAX_CHARS = 60;

const SMASH_CONTEXT = `Smash is a goal tracker app that helps people smash their biggest goals through daily check-ins, milestones, weekly reviews, and journaling. Core message: consistency beats motivation. Tone: direct, relatable, no corporate fluff.`;

const HOOK_EXAMPLES = [
  'This person showed me how to track x',
  'This topper showed me how he studies x hours every day',
  'This Ironman finisher showed me how he tracks every training day',
  'This triathlete showed me what keeps him consistent for months',
  'This Ironman athlete showed me how he never loses momentum',
  'This athlete showed me how he turned daily effort into an Ironman finish',
  'He showed me how he tracked every step toward becoming an Ironman',
  'This Ironman athlete showed me how he stays on track without motivation',
  'This triathlete showed me how he tracks all three sports',
];

export function buildThisPersonSystemPrompt() {
  return `You create "This person" short-form video content for Smash app marketing reels (Instagram, TikTok, YouTube Shorts).

${SMASH_CONTEXT}

CONTENT TYPE — "This person" reels:
- Hook: A scroll-stopping opening line about someone (a topper, athlete, founder, etc.) who showed the viewer how they track or stay consistent toward a goal using Smash.
- Caption: ONE short line only (under ~80 characters). Promotes Smash subtly. No hashtags in caption.
- Hashtags: 1–3 relevant hashtags picked ONLY from the provided pool.

HOOK RULES:
1. Follow patterns like:
${HOOK_EXAMPLES.map((h) => `   - "${h}"`).join('\n')}
2. Adapt the persona (topper, athlete, founder, etc.) and action to match the goal.
3. Use natural English. Readable in 1–3 seconds (~8–18 words).
4. STRICT: Hook text must be ${THIS_PERSON_HOOK_MAX_CHARS} characters or fewer (count every letter, space, and punctuation).
5. No hashtags or emojis in hooks.
6. No invented stats or fake testimonials.

CAPTION RULES:
1. Exactly ONE line — no line breaks, no bullet points.
2. Short and punchy (typically 4–12 words).
3. Relate to the hook and goal. Examples: "Best tool to stay on track for exam prep", "How I never miss a training day".

HASHTAG RULES:
1. Pick 1–3 hashtags from the provided pool only.
2. Must be relevant to the hook text and goal.
3. Return with leading # (e.g. "#study").

Respond with valid JSON only (no markdown fences):
{
  "entries": [
    {
      "hookText": "This topper showed me how he tracks his study plan",
      "caption": "Best tool to stay on track for exam prep",
      "hashtags": ["#study", "#exam"]
    }
  ]
}`;
}

export function buildThisPersonUserPrompt({
  goalName,
  hookText = '',
  customInstruction = '',
  hashtagPool = [],
  count = 3,
}) {
  const poolLines = hashtagPool
    .slice(0, 40)
    .map((h) => `- ${h.hashtag} (${h.category})`)
    .join('\n');

  const fixedHookBlock = hookText.trim()
    ? `
FIXED HOOK (use this EXACT text — do not change a single word):
"${hookText.trim()}"

Generate exactly 1 entry with this hook. Create caption and hashtags to match.`
    : `
Generate ${count} varied hook + caption pairs for this goal. Each hook should use a different persona/angle while staying relevant to the goal.`;

  const instructionBlock = customInstruction.trim()
    ? `\nADDITIONAL INSTRUCTIONS FROM USER:\n${customInstruction.trim()}\n`
    : '';

  return `Goal: "${goalName.trim()}"
${fixedHookBlock}
${instructionBlock}
Available hashtags (pick from these only):
${poolLines || '(none — return generic goal-relevant tags as #goals #habits if pool empty)'}

Return JSON with an "entries" array. Each entry needs hookText, caption (one line, no hashtags), and hashtags (array of 1–3 tags from the pool).`;
}

export { parseModelJson } from './parseModelJson.mjs';

function clampThisPersonHook(text, max = THIS_PERSON_HOOK_MAX_CHARS) {
  const trimmed = String(text ?? '').trim();
  if (trimmed.length <= max) return trimmed;

  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.5) {
    return cut.slice(0, lastSpace).trim();
  }
  return cut.trim();
}

export function normalizeThisPersonEntries(parsed, { fixedHookText = '' } = {}) {
  const raw = Array.isArray(parsed?.entries) ? parsed.entries : [];
  const seen = new Set();
  const entries = [];

  for (const item of raw) {
    const hookText = clampThisPersonHook(
      fixedHookText.trim() || String(item?.hookText ?? '').trim()
    );
    const caption = String(item?.caption ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/#\S+/g, '')
      .trim();
    const hashtags = (Array.isArray(item?.hashtags) ? item.hashtags : [])
      .map((tag) => {
        const t = String(tag ?? '').trim();
        return t.startsWith('#') ? t : `#${t}`;
      })
      .filter(Boolean);

    if (!hookText || !caption) continue;

    const key = hookText.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    entries.push({
      hookText,
      caption,
      hashtag: hashtags.slice(0, 3).join(' '),
    });
  }

  return entries;
}
