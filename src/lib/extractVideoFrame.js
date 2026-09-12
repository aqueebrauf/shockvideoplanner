/**
 * Extract the first frame of a video file as a JPEG blob (browser-only).
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
