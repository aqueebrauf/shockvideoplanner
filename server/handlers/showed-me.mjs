import {
  buildLibraryStorageKey,
  buildStorageKey,
  createPresignedUploadUrl,
  deleteFromR2,
  extensionFromMime,
  objectExistsInR2,
  uploadBufferToR2,
} from '../lib/r2Client.mjs';

const LIBRARY_CLIP = 'goal_demo_library_clip';
const LIBRARY_FRAME = 'goal_demo_library_frame';
import {
  buildImagePayload,
  buildKlingVideoPayload,
  downloadToBuffer,
  estimateGeneration,
  extractOutputUrl,
  getGenerationStatus,
  submitGeneration,
} from '../lib/higgsfieldClient.mjs';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

async function handlePresignUpload(payload) {
  const { goalId, planId, goalName, backgroundName, assetType, iteration, contentType, fileName } =
    payload;
  if (!goalId || !assetType || !contentType) {
    return jsonResponse(400, { error: 'goalId, assetType, and contentType are required.' });
  }

  const ext =
    fileName?.split('.').pop()?.toLowerCase() ??
    extensionFromMime(contentType);

  let storageKey;
  if (assetType === LIBRARY_CLIP || assetType === LIBRARY_FRAME) {
    if (!goalName?.trim() || !backgroundName?.trim()) {
      return jsonResponse(400, {
        error: 'goalName and backgroundName are required for demo library uploads.',
      });
    }
    storageKey = buildLibraryStorageKey({
      goalName,
      backgroundName,
      kind: assetType === LIBRARY_FRAME ? 'frame' : 'video',
      ext,
    });
  } else {
    if (!planId) {
      return jsonResponse(400, { error: 'planId is required for plan asset uploads.' });
    }
    storageKey = buildStorageKey({
      goalId,
      planId,
      assetType,
      iteration: iteration ?? 1,
      ext,
    });
  }

  const result = await createPresignedUploadUrl({ storageKey, contentType });
  return jsonResponse(200, result);
}

async function handleDeleteObject(payload) {
  const { storageKey } = payload;
  if (!storageKey) {
    return jsonResponse(400, { error: 'storageKey is required.' });
  }
  await deleteFromR2(storageKey);
  return jsonResponse(200, { ok: true });
}

async function handleVerifyUpload(payload) {
  const { storageKey } = payload;
  if (!storageKey) {
    return jsonResponse(400, { error: 'storageKey is required.' });
  }
  const exists = await objectExistsInR2(storageKey);
  return jsonResponse(200, { ok: exists });
}

async function handleGenerateHookImage(payload) {
  const { prompt, aspectRatio, resolution, quality, imageUrls, modelId, planId } = payload;
  const { endpoint, body } = buildImagePayload({
    modelId,
    prompt,
    aspectRatio,
    resolution,
    quality,
    imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
  });
  const result = await submitGeneration(endpoint, body);
  return jsonResponse(200, {
    requestId: result.request_id,
    status: result.status,
    statusUrl: result.status_url,
    planId: planId ?? null,
  });
}

async function handleGenerateHookVideo(payload) {
  const { prompt, imageUrl, endImageUrl, duration, resolution, sound, planId } = payload;
  const { endpoint, body } = buildKlingVideoPayload({
    prompt,
    imageUrl,
    endImageUrl,
    duration,
    resolution,
    sound,
  });
  const result = await submitGeneration(endpoint, body);
  return jsonResponse(200, {
    requestId: result.request_id,
    status: result.status,
    statusUrl: result.status_url,
    planId: planId ?? null,
  });
}

async function handleEstimate(payload) {
  const kind = payload.kind === 'video' ? 'video' : 'image';
  const built =
    kind === 'video'
      ? buildKlingVideoPayload(payload)
      : buildImagePayload({
          ...payload,
          prompt: payload.prompt?.trim() || 'Estimate',
        });
  const estimate = await estimateGeneration(built.endpoint, built.body);
  return jsonResponse(200, estimate);
}

async function handlePollGeneration(payload) {
  const { requestId, goalId, planId, assetType, iteration } = payload;
  if (!requestId || !goalId || !planId || !assetType) {
    return jsonResponse(400, {
      error: 'requestId, goalId, planId, and assetType are required.',
    });
  }

  const statusBody = await getGenerationStatus(requestId);
  const { status, url, mimeType, error } = extractOutputUrl(statusBody);

  if (status === 'failed' || status === 'nsfw' || status === 'canceled') {
    return jsonResponse(200, { status, error: error ?? `Generation ${status}.` });
  }

  if (status !== 'completed' || !url) {
    return jsonResponse(200, { status: status ?? 'processing' });
  }

  const { buffer, contentType } = await downloadToBuffer(url);
  const resolvedMime = mimeType ?? contentType;
  const storageKey = buildStorageKey({
    goalId,
    planId,
    assetType,
    iteration: iteration ?? 1,
    ext: extensionFromMime(resolvedMime),
  });

  const uploaded = await uploadBufferToR2({
    storageKey,
    buffer,
    contentType: resolvedMime,
  });

  return jsonResponse(200, {
    status: 'completed',
    storageKey: uploaded.storageKey,
    publicUrl: uploaded.publicUrl,
    mimeType: resolvedMime,
  });
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = parseBody(await req.text());
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' });
  }

  const action = body.action;
  if (!action) {
    return jsonResponse(400, { error: 'action is required.' });
  }

  try {
    switch (action) {
      case 'presign-upload':
        return await handlePresignUpload(body);
      case 'delete-object':
        return await handleDeleteObject(body);
      case 'verify-upload':
        return await handleVerifyUpload(body);
      case 'generate-hook-image':
        return await handleGenerateHookImage(body);
      case 'generate-hook-video':
        return await handleGenerateHookVideo(body);
      case 'estimate-generation':
        return await handleEstimate(body);
      case 'poll-generation':
        return await handlePollGeneration(body);
      default:
        return jsonResponse(400, { error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const status = Number(err?.status);
    return jsonResponse(status >= 400 && status < 600 ? status : 500, {
      error: err?.message ?? 'Showed Me API request failed.',
    });
  }
};
