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
9. Paragraph spacing: put one blank line between paragraphs (use \\n\\n). Each structural line from the style is its own paragraph. Keep numbered or bulleted lists together in one paragraph with single line breaks between items.
10. Character voice: the character owns this account and posts the reel themselves. Not every caption needs first person — factual, listicle, educational, and other objective styles can stay impersonal with no "I/me/my". When the caption DOES involve the poster personally (their story, POV, experience, transformation), use first person — never refer to the character by name or in third person (no "she", "he", "they", "Meet [name]", "[name] shows you", etc.). You are the character, not a narrator describing them.

Respond with valid JSON only (no markdown fences):
{
  "styleUsed": "exact style name from the provided list",
  "captionBody": "caption text with blank lines between paragraphs, no hashtags",
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
    .map((h) => {
      const themes = h.themes?.length ? h.themes.join(', ') : '';
      const keywords = (h.keywords ?? []).slice(0, 6).join(', ');
      const meta = [h.category, themes, keywords].filter(Boolean).join('; ');
      return `${h.hashtag} [${meta}]`;
    })
    .join('\n');

  const styleInstruction =
    captionStyle === 'intelligent'
      ? 'CAPTION STYLE: Intelligent — pick the single best style from the list based on hook signals, goal, and CTA. Set styleUsed to that style name.'
      : `CAPTION STYLE: You MUST use "${captionStyle}" exactly. Set styleUsed to "${captionStyle}".`;

  const customBlock = customInstruction?.trim()
    ? `\nEDITOR CUSTOM INSTRUCTIONS (high priority):\n${customInstruction.trim()}`
    : '';

  const characterBlock = characterName?.trim()
    ? `\nCHARACTER (this person owns the account and posts the reel):\n${characterName.trim()}\nMatch the caption style — objective/factual styles need no personal voice. When the caption involves this character personally, use first person (I/me/my), never third person or their name as if someone else is writing about them.`
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

export { parseModelJson } from './parseModelJson.mjs';
