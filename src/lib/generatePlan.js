const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY?.trim() || '';
}

function buildPrompt({
  hookText,
  goalTitles,
  screens,
  referenceLink,
  ctaText,
  customInstruction,
}) {
  const screenList = screens
    .filter((screen) => screen.name.trim())
    .map((screen) => `- id ${screen.id}: ${screen.name}`)
    .join('\n');

  const optionalLines = [
    referenceLink.trim()
      ? `Reference video (energy/tone inspiration): ${referenceLink.trim()}`
      : '',
    ctaText.trim() ? `CTA (for context only, not part of demo): ${ctaText.trim()}` : '',
    customInstruction.trim()
      ? `Custom instructions: ${customInstruction.trim()}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `You are planning a short Instagram/TikTok reel for Smash (www.smash.am), a goal-tracking app.

REEL STRUCTURE:
1. HOOK (first screen): A shock clip of a person reacting. This is always the opening and is already handled separately — do NOT include it in screenIds.
2. DEMO (following screens): Mobile camera recordings of the Smash web app (smash.am) running in a browser. The footage should feel like genuine user-generated content — someone just discovered the app and is showing it off. Select ONLY from the available demo screens below.

AVAILABLE DEMO SCREENS (use only these IDs):
${screenList}

INPUT:
Hook copy: ${hookText.trim()}
Goals featured: ${goalTitles.join(', ')}
${optionalLines ? `\n${optionalLines}` : ''}

TASK:
Understand the energy of the hook copy and the goals. Decide which demo screens are required and the order they should appear. Keep the demo as short as possible while still making the point. The sequence should make narrative sense even if real users might tap through the app differently. Not every screen is needed.

Return ONLY valid JSON with no markdown fences or extra text:
{"screenIds":[2,3,4]}

Rules:
- screenIds must contain only IDs from the available demo screens list
- Prefer 2–5 demo screens; use fewer when possible
- Order matters
- Do not repeat IDs`;
}

function parseScreenIdsResponse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude did not return valid JSON.');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed.screenIds)) {
    throw new Error('Claude response is missing screenIds.');
  }

  return parsed.screenIds.filter((id) => Number.isInteger(id));
}

function formatApiError(status, detail) {
  if (detail.includes('<html>')) {
    return `Plan generation failed (${status}).`;
  }

  try {
    const parsed = JSON.parse(detail);
    const message = parsed?.error?.message;
    if (message) return message;
  } catch {
    /* not JSON */
  }

  return detail.trim() || `Plan generation failed (${status}).`;
}

export async function generatePlanScreenSequence({
  hookText,
  goalTitles,
  screens,
  referenceLink = '',
  ctaText = '',
  customInstruction = '',
}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'Anthropic API key is not configured. Add VITE_ANTHROPIC_API_KEY to .env.local locally, or in Netlify → Site configuration → Environment variables, then redeploy.'
    );
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: buildPrompt({
            hookText,
            goalTitles,
            screens,
            referenceLink,
            ctaText,
            customInstruction,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(formatApiError(response.status, detail));
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';
  const screenIds = parseScreenIdsResponse(text);
  const screenById = Object.fromEntries(screens.map((screen) => [screen.id, screen]));

  return [
    { name: 'Hook screen', copy: '' },
    ...screenIds
      .filter((id) => screenById[id])
      .map((id) => ({ name: screenById[id].name, copy: '' })),
  ];
}
