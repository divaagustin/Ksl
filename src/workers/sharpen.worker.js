/**
 * Web Worker for Image HD Sharpening Filter (Unsharp Masking)
 * Offloads heavy pixel iterations off the main UI thread.
 */

self.onmessage = function (e) {
  const { data, width, height, strength } = e.data;
  const w = width;
  const h = height;
  const src = new Uint8ClampedArray(data);
  const dst = new Uint8ClampedArray(data);
  const weight = (strength / 100) * 0.6;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[((y - 1) * w + x) * 4 + c];
        const bottom = src[((y + 1) * w + x) * 4 + c];
        const left = src[(y * w + (x - 1)) * 4 + c];
        const right = src[(y * w + (x + 1)) * 4 + c];
        const center = src[idx + c];

        // Laplacian kernel convolution
        const laplacian = 4 * center - top - bottom - left - right;
        dst[idx + c] = Math.min(255, Math.max(0, center + laplacian * weight));
      }
    }
  }

  self.postMessage({ data: dst.buffer }, [dst.buffer]);
};
