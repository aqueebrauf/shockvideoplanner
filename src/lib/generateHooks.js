const API_PATH = '/api/generate-hooks';

export async function generateHooks() {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Hook service returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Hook generation failed.');
  }

  return payload;
}
