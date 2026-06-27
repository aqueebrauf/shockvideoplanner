const API_PATH = '/api/generate-caption';

export async function generateCaption({
  hook,
  goalName,
  screens,
  ctaText,
  captionStyle = 'intelligent',
  customInstruction = '',
}) {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hook,
      goalName,
      screens,
      ctaText,
      captionStyle,
      customInstruction,
    }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Caption service returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Caption generation failed.');
  }

  return payload;
}
