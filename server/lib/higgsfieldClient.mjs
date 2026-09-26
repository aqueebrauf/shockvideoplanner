import {
  DEFAULT_IMAGE_ASPECT_RATIO,
  DEFAULT_IMAGE_RESOLUTION,
  DEFAULT_VIDEO_DURATION,
  DEFAULT_VIDEO_RESOLUTION,
  DEFAULT_VIDEO_SOUND,
  imageModelById,
  klingEndpointForResolution,
} from '../../shared/higgsfieldModels.js';

const HIGGSFIELD_BASE = 'https://api.higgsfield.ai';
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'nsfw', 'canceled']);

function cleanEnv(value) {
  let text = String(value ?? '').replace(/^\uFEFF/, '').trim();
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

function credentials() {
  let keyId = cleanEnv(process.env.HIGGSFIELD_API_KEY_ID);
  let secret = cleanEnv(process.env.HIGGSFIELD_API_KEY_SECRET);
  if (/^key\s+/i.test(keyId)) keyId = keyId.replace(/^key\s+/i, '').trim();
  if (keyId.includes(':') && secret && keyId.endsWith(`:${secret}`)) {
    keyId = keyId.slice(0, -(secret.length + 1)).trim();
  }
  if (!keyId || !secret) {
    const err = new Error(
      'Higgsfield API credentials are not configured. Set HIGGSFIELD_API_KEY_ID and HIGGSFIELD_API_KEY_SECRET.'
    );
    err.status = 500;
    throw err;
  }
  return { keyId, secret };
}

function authHeader() {
  const { keyId, secret } = credentials();
  return `Key ${keyId}:${secret}`;
}

function errorMessage(body, status) {
  if (typeof body?.detail === 'string' && body.detail.trim()) return body.detail;
  if (Array.isArray(body?.detail)) {
    const parts = body.detail
      .map((item) => item?.msg ?? item?.message ?? '')
      .filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
  }
  return (
    body?.error?.message ??
    body?.message ??
    `Higgsfield request failed (${status}).`
  );
}

async function higgsfieldFetch(path, options = {}) {
  const response = await fetch(`${HIGGSFIELD_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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
      response.status === 401
        ? 'Higgsfield rejected the API key. In Vercel, set HIGGSFIELD_API_KEY_ID and HIGGSFIELD_API_KEY_SECRET to the key ID and secret from Higgsfield Cloud, for Production, then redeploy.'
        : errorMessage(body, response.status);
    const err = new Error(message);
    err.status = response.status === 401 ? 502 : response.status;
    err.body = body;
    err.correlationId = response.headers.get('x-correlation-id');
    throw err;
  }

  return body;
}

function httpsUrl(value) {
  try {
    const url = new URL(String(value ?? '').trim());
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function buildImagePayload({
  modelId,
  prompt,
  aspectRatio,
  resolution,
  quality,
  imageUrls = [],
}) {
  const model = imageModelById(modelId);
  const trimmed = String(prompt ?? '').trim();
  if (!trimmed) {
    const err = new Error('prompt is required.');
    err.status = 400;
    throw err;
  }

  const aspect = model.aspectRatios.includes(aspectRatio)
    ? aspectRatio
    : model.defaultAspectRatio ?? DEFAULT_IMAGE_ASPECT_RATIO;
  const tier = model.resolutions.includes(resolution)
    ? resolution
    : model.defaultResolution ?? DEFAULT_IMAGE_RESOLUTION;
  const urls = imageUrls.map(httpsUrl).filter(Boolean).slice(0, model.maxReferences);

  if (model.id === 'qwen-image-3' && urls.length > 0) {
    return {
      endpoint: model.editEndpoint,
      body: {
        prompt: trimmed,
        image_urls: urls,
        resolution: tier,
        aspect_ratio: aspect,
        prompt_extend: false,
        enable_thinking: false,
        prompt_extend_mode: 'direct',
      },
    };
  }

  const body = {
    prompt: trimmed,
    aspect_ratio: aspect,
    resolution: tier,
  };
  if (urls.length > 0) body.image_urls = urls;
  if (model.qualities?.length) {
    body.quality = model.qualities.includes(quality) ? quality : model.defaultQuality;
  }

  return { endpoint: model.endpoint, body };
}

export function buildKlingVideoPayload({
  prompt,
  imageUrl,
  endImageUrl,
  duration,
  resolution,
  sound,
}) {
  const start = httpsUrl(imageUrl);
  if (!start) {
    const err = new Error('A public start-frame image URL is required.');
    err.status = 400;
    throw err;
  }

  const parsedDuration = Number(duration ?? DEFAULT_VIDEO_DURATION);
  const seconds = Number.isFinite(parsedDuration)
    ? Math.min(15, Math.max(3, Math.round(parsedDuration)))
    : DEFAULT_VIDEO_DURATION;
  const tier = ['720p', '1080p', '4k'].includes(resolution)
    ? resolution
    : DEFAULT_VIDEO_RESOLUTION;
  const audio = sound === 'on' ? 'on' : DEFAULT_VIDEO_SOUND;

  const body = {
    prompt: String(prompt ?? '').trim() || 'Smooth cinematic transition',
    image_url: start,
    duration: seconds,
    sound: audio,
  };
  const end = httpsUrl(endImageUrl);
  if (end) body.last_image_url = end;

  return {
    endpoint: klingEndpointForResolution(tier),
    body,
  };
}

export async function estimateGeneration(endpoint, body) {
  const result = await higgsfieldFetch(`/estimate/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return {
    credits: result?.credits ?? null,
    usd: result?.usd ?? null,
  };
}

export async function submitGeneration(endpoint, body) {
  const result = await higgsfieldFetch(`/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!result?.request_id) {
    const err = new Error('Higgsfield did not return a request id.');
    err.status = 502;
    throw err;
  }
  return result;
}

export async function getGenerationStatus(requestId) {
  return higgsfieldFetch(`/requests/${encodeURIComponent(requestId)}/status`, {
    method: 'GET',
  });
}

export function extractOutputUrl(statusBody) {
  const status = statusBody?.status ?? 'processing';
  if (!TERMINAL_STATUSES.has(status) || status !== 'completed') {
    return {
      status,
      url: null,
      error: statusBody?.error ?? (TERMINAL_STATUSES.has(status) ? `Generation ${status}.` : null),
    };
  }

  const videoUrl = statusBody?.video?.url;
  if (videoUrl) return { status, url: videoUrl, mimeType: 'video/mp4' };

  const imageUrl = statusBody?.images?.[0]?.url ?? statusBody?.image?.url;
  if (imageUrl) return { status, url: imageUrl, mimeType: 'image/jpeg' };

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
