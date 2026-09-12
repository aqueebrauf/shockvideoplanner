const HIGGSFIELD_BASE = 'https://platform.higgsfield.ai';

function authHeader() {
  const keyId = process.env.HIGGSFIELD_API_KEY_ID?.trim();
  const secret = process.env.HIGGSFIELD_API_KEY_SECRET?.trim();
  if (!keyId || !secret) {
    throw new Error('Higgsfield API credentials are not configured.');
  }
  return `Key ${keyId}:${secret}`;
}

async function higgsfieldFetch(path, options = {}) {
  const response = await fetch(`${HIGGSFIELD_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  if (!response.ok) {
    const message =
      body?.error?.message ??
      body?.message ??
      body?.detail ??
      `Higgsfield request failed (${response.status}).`;
    const err = new Error(message);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return body;
}

export async function submitHookImageGeneration({
  prompt,
  aspectRatio = '9:16',
  resolution = '720p',
  imageUrls = [],
}) {
  const payload = {
    prompt,
    aspect_ratio: aspectRatio,
    resolution,
  };
  if (imageUrls.length > 0) {
    payload.image_urls = imageUrls;
  }

  return higgsfieldFetch('/higgsfield-ai/soul/standard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function submitHookVideoGeneration({
  prompt,
  imageUrl,
  endImageUrl,
  enhancePrompt = false,
}) {
  return higgsfieldFetch('/higgsfield-ai/dop/turbo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_url: imageUrl,
      end_image_url: endImageUrl,
      enhance_prompt: enhancePrompt,
    }),
  });
}

export async function getGenerationStatus(requestId) {
  return higgsfieldFetch(`/requests/${requestId}/status`, { method: 'GET' });
}

export function extractOutputUrl(statusBody) {
  const status = statusBody?.status;
  if (status !== 'completed') {
    return { status, url: null, error: statusBody?.error ?? null };
  }

  const videoUrl = statusBody?.video?.url ?? statusBody?.output?.video?.url;
  if (videoUrl) {
    return { status, url: videoUrl, mimeType: 'video/mp4' };
  }

  const imageUrl =
    statusBody?.images?.[0]?.url ??
    statusBody?.image?.url ??
    statusBody?.output?.images?.[0]?.url;
  if (imageUrl) {
    return { status, url: imageUrl, mimeType: 'image/jpeg' };
  }

  return { status, url: null, error: 'Completed but no output URL found.' };
}

export async function downloadToBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download generated file (${response.status}).`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
  return { buffer: Buffer.from(arrayBuffer), contentType };
}
