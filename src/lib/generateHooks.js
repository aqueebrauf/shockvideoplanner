const API_PATH = '/api/generate-hooks';

export async function generateHooks() {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const contentType = response.headers.get('content-type') ?? '';
  let payload = null;

  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else if (response.status === 404) {
    throw new Error(
      'Hook API not found. Use `npm run dev` (Netlify Dev) locally, or trigger a fresh deploy on Netlify if you are on production.'
    );
  } else {
    throw new Error('Hook service returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Hook generation failed.');
  }

  return payload;
}
