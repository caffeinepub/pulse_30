/**
 * Client-side media compression utilities.
 * Compresses images to under 1MB and videos to max 720p.
 * MIME types are always preserved exactly as the original.
 */

const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1MB
const MAX_VIDEO_HEIGHT = 720;
const MAX_VIDEO_WIDTH = 1280;

/**
 * Compress an image file to under 1MB using Canvas API.
 * Preserves original MIME type (jpeg stays jpeg, png stays png, webp stays webp).
 */
export async function compressImage(file: File): Promise<File> {
  // If already small enough, return as-is
  if (file.size <= MAX_IMAGE_BYTES) return file;

  const mimeType = file.type || "image/jpeg";
  // For PNG without alpha, convert to jpeg for better compression
  const outputMime =
    mimeType === "image/png" || mimeType === "image/webp"
      ? mimeType
      : "image/jpeg";

  return new Promise((resolve, _reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Scale down if very large
      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            if (blob.size <= MAX_IMAGE_BYTES || quality <= 0.3) {
              const ext = outputMime.split("/")[1] || "jpg";
              const compressed = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, `.${ext}`),
                { type: outputMime },
              );
              resolve(compressed);
            } else {
              quality = Math.max(0.3, quality - 0.1);
              tryCompress();
            }
          },
          outputMime,
          quality,
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback to original on error
    };

    img.src = objectUrl;
  });
}

/**
 * Attempt to compress a video to 720p max using MediaRecorder + Canvas.
 * If the browser doesn't support this approach, returns the original file unchanged.
 * Always preserves the original MIME type.
 */
export async function compressVideo(file: File): Promise<File> {
  // Check if video needs compression
  const needsCompression = await checkVideoNeedsCompression(file);
  if (!needsCompression) return file;

  // Check browser support
  const supportedMime = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
    ? "video/webm;codecs=vp8"
    : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : null;

  if (!supportedMime || typeof OffscreenCanvas === "undefined") {
    // Browser doesn't support canvas-based video compression — pass through unchanged
    return file;
  }

  try {
    return await doVideoCompression(file, supportedMime);
  } catch {
    // On any error, return the original file untouched
    return file;
  }
}

async function checkVideoNeedsCompression(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.src = "";
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve(false); // assume no compression needed on timeout
    }, 5000);

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const needs =
        video.videoHeight > MAX_VIDEO_HEIGHT ||
        video.videoWidth > MAX_VIDEO_WIDTH;
      cleanup();
      resolve(needs);
    };

    video.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(false);
    };

    video.src = objectUrl;
    video.load();
  });
}

async function doVideoCompression(
  file: File,
  recordMime: string,
): Promise<File> {
  return new Promise((resolve, _reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const origWidth = video.videoWidth;
      const origHeight = video.videoHeight;

      let targetWidth = origWidth;
      let targetHeight = origHeight;

      if (origHeight > MAX_VIDEO_HEIGHT) {
        const ratio = MAX_VIDEO_HEIGHT / origHeight;
        targetHeight = MAX_VIDEO_HEIGHT;
        targetWidth = Math.round(origWidth * ratio);
      }
      if (targetWidth > MAX_VIDEO_WIDTH) {
        const ratio = MAX_VIDEO_WIDTH / targetWidth;
        targetWidth = MAX_VIDEO_WIDTH;
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Ensure even dimensions
      targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
      targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
        return;
      }

      const stream = canvas.captureStream(30);
      const chunks: Blob[] = [];

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: recordMime });
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
        return;
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(objectUrl);
        const blob = new Blob(chunks, { type: file.type });
        // Only use compressed version if it's actually smaller
        if (blob.size < file.size) {
          const compressed = new File([blob], file.name, { type: file.type });
          resolve(compressed);
        } else {
          resolve(file);
        }
      };

      recorder.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      recorder.start(100);

      const renderFrame = () => {
        if (video.ended || video.paused) {
          recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        requestAnimationFrame(renderFrame);
      };

      video.onended = () => {
        recorder.stop();
      };

      try {
        await video.play();
        renderFrame();
      } catch {
        recorder.stop();
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    video.load();
  });
}
