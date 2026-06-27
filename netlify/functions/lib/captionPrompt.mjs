const SMASH_PRODUCT = `Smash is a goal tracker app that helps people smash their biggest goals by:
- Showing up daily (daily check-ins / streaks)
- Setting milestones and marking them complete
- Weekly check-ins (on track or behind + weekly focus)
- Journaling progress

Core message: consistency beats motivation. Never miss twice — one missed day is a mistake, two is a new habit of quitting.
Tone: direct, relatable, no corporate fluff. Never invent statistics, user counts, or testimonials.`;

export function buildSystemPrompt() {
  return `You write short-form video captions for Smash app marketing reels (Instagram, TikTok, YouTube Shorts).

${SMASH_PRODUCT}

CAPTION RULES:
1. First line must hook — echo the video hook or extend curiosity (only ~125 chars show before "more").
2. Match the selected CTA exactly in the final line (comment keyword, link in bio, etc.).
3. Tie benefits to features shown in the screen sequence when possible.
4. One specific goal per caption — speak to that goal's audience.
5. No invented stats, user counts, or fake testimonials.
6. Emojis: 0–2 max, only when the style allows.
7. Custom instructions from the editor override these rules when they don't conflict with "no invented stats".
8. Hashtags are NOT part of captionBody — pick them separately from the provided pool only.

Respond with valid JSON only (no markdown fences):
{
  "styleUsed": "exact style name from the provided list",
  "captionBody": "caption text with line breaks, no hashtags",
  "hashtags": ["#tag1", "#tag2"]
}`;
}

export function buildUserPrompt({
  hook,
  goalName,
  characterName = '',
  screens,
  ctaText,
  captionStyle,
  customInstruction,
  styles,
  hashtagPool,
}) {
  const styleBlock = styles
    .map(
      (s) =>
        `### ${s.style}
Hook signals: ${s.hookSignals}
Structure: ${s.structure}
Rules: ${s.guide}
Max chars: ${s.maxChars ?? 'flexible'}
Example:
${s.example}`
    )
    .join('\n\n');

  const screenBlock = screens
    .map((s, i) => `${i + 1}. ${s.name}: ${s.copy}`)
    .join('\n');

  const hashtagBlock = hashtagPool
    .map((h) => `${h.hashtag} [${h.category}${h.themes?.length ? `, ${h.themes.join(', ')}` : ''}]`)
    .join('\n');

  const styleInstruction =
    captionStyle === 'intelligent'
      ? 'CAPTION STYLE: Intelligent — pick the single best style from the list based on hook signals, goal, and CTA. Set styleUsed to that style name.'
      : `CAPTION STYLE: You MUST use "${captionStyle}" exactly. Set styleUsed to "${captionStyle}".`;

  const customBlock = customInstruction?.trim()
    ? `\nEDITOR CUSTOM INSTRUCTIONS (high priority):\n${customInstruction.trim()}`
    : '';

  const characterBlock = characterName?.trim()
    ? `\nCHARACTER (voice/persona for this reel):\n${characterName.trim()}`
    : '';

  return `${styleInstruction}

HOOK:
${hook}

GOAL:
${goalName}
${characterBlock}

CTA (must appear in caption):
${ctaText}

SCREEN SEQUENCE (what the video shows):
${screenBlock}

AVAILABLE CAPTION STYLES:
${styleBlock}
${customBlock}

HASHTAG RULES:
- Pick exactly 3 or 4 hashtags from the pool below — only tags listed, copy them exactly including #
- Prefer medium and niche categories over broad (at most 1 broad tag if any)
- Match the goal and hook audience (study goals → study tags, business goals → business tags, etc.)
- Tags must exist in the pool — do not invent tags

HASHTAG POOL:
${hashtagBlock}`;
}

export function parseModelJson(text) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Model did not return JSON.');
  }
  return JSON.parse(jsonMatch[0]);
}
