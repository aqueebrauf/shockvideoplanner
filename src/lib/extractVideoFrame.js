/**
 * Browser-only video frame extraction and image transforms (zero API cost).
 */

/**
 * Extract the first frame of a video file as a JPEG blob.
 */
export function extractFirstVideoFrame(file, { seekTime = 0.1 } = {}) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    let settled = false;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
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

    video.addEventListener('error', () => fail('Could not load video for frame extraction.'));

    video.addEventListener('loadeddata', () => {
      try {
        video.currentTime = Math.min(seekTime, video.duration || seekTime);
      } catch {
        fail('Could not seek video for frame extraction.');
      }
    });

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fail('Canvas is not available.');
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
    });

    video.src = objectUrl;
  });
}

/**
 * Re-extract the first frame from a demo already stored on R2 (fetches then extracts locally).
 */
export async function extractFirstVideoFrameFromUrl(url, options = {}) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not fetch demo video for frame extraction.');
  }
  const blob = await response.blob();
  const file = new File([blob], 'demo.mp4', { type: blob.type || 'video/mp4' });
  return extractFirstVideoFrame(file, options);
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
