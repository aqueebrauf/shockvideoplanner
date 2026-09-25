/**
 * Browser-only video frame extraction and image transforms (zero API cost).
 */

const FIRST_FRAME_TIME = 0;
const NEAR_ZERO = 1e-4;
const EXTRACT_TIMEOUT_MS = 20000;

function extractFrameFromSrc(
  src,
  { seekTime = FIRST_FRAME_TIME, revokeSrc = false, crossOrigin = false } = {}
) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.controls = false;
    if (crossOrigin) video.crossOrigin = 'anonymous';

    video.style.cssText =
      'position:fixed;left:-99999px;top:0;width:16px;height:16px;opacity:0;pointer-events:none;';
    document.body.appendChild(video);

    let settled = false;
    let started = false;
    const timeoutId = window.setTimeout(
      () => fail('Timed out extracting the first video frame.'),
      EXTRACT_TIMEOUT_MS
    );

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      if (revokeSrc) URL.revokeObjectURL(src);
    };

    const fail = (message) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    const succeed = (blob) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(blob);
    };

    const capture = () => {
      if (settled) return;
      try {
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (!width || !height) {
          fail('Video has no dimensions.');
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fail('Canvas is not available.');
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              fail('Could not encode video frame.');
              return;
            }
            succeed(blob);
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        fail(err.message ?? 'Frame extraction failed.');
      }
    };

    const capturePresentedFrame = () => {
      if (settled) return;
      if (typeof video.requestVideoFrameCallback === 'function') {
        video.requestVideoFrameCallback(() => capture());
        window.setTimeout(() => {
          if (!settled) capture();
        }, 800);
        return;
      }
      requestAnimationFrame(() => requestAnimationFrame(() => capture()));
    };

    const onReady = () => {
      if (started || settled) return;
      if (!video.videoWidth || !video.videoHeight) return;
      started = true;

      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const target = Math.max(0, Math.min(seekTime, duration || seekTime));

      // Stay on the decoded first frame. Seeking away (e.g. 0.1s) captures a later frame,
      // and setting currentTime to 0 when already at 0 often never fires `seeked`.
      if (target <= NEAR_ZERO && video.currentTime <= NEAR_ZERO) {
        capturePresentedFrame();
        return;
      }

      try {
        video.currentTime = target;
      } catch {
        fail('Could not seek video for frame extraction.');
      }
    };

    video.addEventListener('error', () => fail('Could not load video for frame extraction.'));
    video.addEventListener('seeked', capturePresentedFrame);
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('loadeddata', onReady);
    video.src = src;
    video.load();
  });
}

/**
 * Extract the first frame of a video file as a JPEG blob (exactly 0:00:00).
 */
export function extractFirstVideoFrame(file, options = {}) {
  const objectUrl = URL.createObjectURL(file);
  return extractFrameFromSrc(objectUrl, { ...options, seekTime: options.seekTime ?? FIRST_FRAME_TIME, revokeSrc: true });
}

/**
 * Re-extract the first frame from a demo already stored on R2.
 * Prefers streaming the URL (only the start of the file) and falls back to a full fetch.
 */
export async function extractFirstVideoFrameFromUrl(url, options = {}) {
  try {
    return await extractFrameFromSrc(url, {
      ...options,
      seekTime: options.seekTime ?? FIRST_FRAME_TIME,
      crossOrigin: true,
    });
  } catch (directError) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Could not fetch demo video for frame extraction.');
      }
      const blob = await response.blob();
      const file = new File([blob], 'demo.mp4', { type: blob.type || 'video/mp4' });
      return await extractFirstVideoFrame(file, options);
    } catch {
      throw directError instanceof Error
        ? directError
        : new Error('Could not fetch demo video for frame extraction.');
    }
  }
}

/**
 * Rotate an image blob by 90-degree multiples (e.g. 90, -90, 180, 270).
 */
export function rotateImageBlob(blob, degrees) {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized === 0) {
    return Promise.resolve(blob);
  }
  if (normalized % 90 !== 0) {
    return Promise.reject(new Error('Rotation must be a multiple of 90 degrees.'));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    let settled = false;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    const fail = (message) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    const succeed = (rotated) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(rotated);
    };

    img.addEventListener('error', () => fail('Could not load image for rotation.'));

    img.addEventListener('load', () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fail('Canvas is not available.');
          return;
        }

        const swap = normalized === 90 || normalized === 270;
        canvas.width = swap ? img.height : img.width;
        canvas.height = swap ? img.width : img.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((normalized * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob(
          (rotated) => {
            if (!rotated) {
              fail('Could not encode rotated image.');
              return;
            }
            succeed(rotated);
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        fail(err.message ?? 'Image rotation failed.');
      }
    });

    img.src = objectUrl;
  });
}
