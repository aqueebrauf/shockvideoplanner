const API_PATH = '/api/generate-this-person';

export async function generateThisPerson({
  goalName,
  hookText = '',
  customInstruction = '',
}) {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goalName,
      hookText,
      customInstruction,
    }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('This person service returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(payload.error ?? 'This person generation failed.');
  }

  return payload;
}
