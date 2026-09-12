const API_PATH = '/api/person-video';

async function postPersonVideoAction(payload) {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? 'Person video API request failed.');
  }
  return body;
}

export async function presignPersonVideoUpload({
  goalId,
  planId,
  assetType,
  iteration,
  contentType,
  fileName,
}) {
  return postPersonVideoAction({
    action: 'presign-upload',
    goalId,
    planId,
    assetType,
    iteration,
    contentType,
    fileName,
  });
}

export async function deletePersonVideoObject(storageKey) {
  return postPersonVideoAction({
    action: 'delete-object',
    storageKey,
  });
}

export async function generateHookImage({
  prompt,
  aspectRatio,
  resolution,
  imageUrls,
}) {
  return postPersonVideoAction({
    action: 'generate-hook-image',
    prompt,
    aspectRatio,
    resolution,
    imageUrls,
  });
}

export async function generateHookVideo({
  prompt,
  imageUrl,
  endImageUrl,
  enhancePrompt,
}) {
  return postPersonVideoAction({
    action: 'generate-hook-video',
    prompt,
    imageUrl,
    endImageUrl,
    enhancePrompt,
  });
}

export async function pollGeneration({
  requestId,
  goalId,
  planId,
  assetType,
  iteration,
}) {
  return postPersonVideoAction({
    action: 'poll-generation',
    requestId,
    goalId,
    planId,
    assetType,
    iteration,
  });
}

async function verifyUploadOnServer(storageKey) {
  const body = await postPersonVideoAction({
    action: 'verify-upload',
    storageKey,
  });
  return Boolean(body.ok);
}

function putFileWithProgress(url, file, onProgress, storageKey) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    let lastProgress = 0;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        lastProgress = Math.round((event.loaded / event.total) * 100);
        onProgress(lastProgress);
      }
    };

    const finishWithVerify = async () => {
      if (!storageKey) {
        reject(new Error('Upload to R2 failed (network error).'));
        return;
      }
      try {
        const ok = await verifyUploadOnServer(storageKey);
        if (ok) {
          resolve();
          return;
        }
      } catch {
        // fall through
      }
      reject(
        new Error(
          'Upload to R2 failed. Add your Vercel URL to the R2 bucket CORS policy (see scripts/r2-cors.json).'
        )
      );
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      if (xhr.status === 0 && lastProgress >= 99) {
        finishWithVerify();
        return;
      }
      reject(new Error(`Upload to R2 failed (${xhr.status}).`));
    };

    xhr.onerror = () => {
      if (lastProgress >= 99) {
        finishWithVerify();
        return;
      }
      reject(new Error('Upload to R2 failed (network error).'));
    };

    xhr.onabort = () => reject(new Error('Upload cancelled.'));

    xhr.send(file);
  });
}

export async function uploadFileToR2({
  file,
  goalId,
  planId,
  assetType,
  iteration,
  onProgress,
}) {
  onProgress?.(0);

  const { uploadUrl, storageKey, publicUrl } = await presignPersonVideoUpload({
    goalId,
    planId,
    assetType,
    iteration,
    contentType: file.type || 'application/octet-stream',
    fileName: file.name,
  });

  await putFileWithProgress(uploadUrl, file, onProgress, storageKey);

  onProgress?.(100);

  return { storageKey, publicUrl, mimeType: file.type || 'application/octet-stream' };
}

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 120;

export async function pollGenerationUntilComplete(params, { onProgress } = {}) {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
    const result = await pollGeneration(params);
    onProgress?.(result);

    if (result.status === 'completed') {
      return result;
    }
    if (result.status === 'failed' || result.status === 'nsfw') {
      throw new Error(result.error ?? `Generation ${result.status}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Generation timed out. Try again or check Higgsfield dashboard.');
}
