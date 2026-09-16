/**
 * Image Processing Utilities for Cam Scanner
 */

/**
 * Applies Sauvola Adaptive Binarization (Thresholding) to image data.
 * Ideal for document scanning to remove soft shadows while keeping text crisp.
 * 
 * @param {ImageData} imageData 
 * @param {number} windowSize - Local neighborhood window size (default: 15)
 * @param {number} k - Sauvola parameter (default: 0.2)
 * @param {number} r - Dynamic range of standard deviation (default: 128)
 */
export function applySauvolaAdaptiveThreshold(imageData, windowSize = 15, k = 0.2, r = 128) {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // 1. Convert to Grayscale & Integral Image computation
  const grayscale = new Uint8Array(width * height);
  const integralSum = new Float64Array((width + 1) * (height + 1));
  const integralSqSum = new Float64Array((width + 1) * (height + 1));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Luminance conversion formula
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      grayscale[y * width + x] = gray;

      const gVal = gray;
      const gValSq = gray * gray;

      integralSum[(y + 1) * (width + 1) + (x + 1)] = 
        gVal + 
        integralSum[y * (width + 1) + (x + 1)] + 
        integralSum[(y + 1) * (width + 1) + x] - 
        integralSum[y * (width + 1) + x];

      integralSqSum[(y + 1) * (width + 1) + (x + 1)] = 
        gValSq + 
        integralSqSum[y * (width + 1) + (x + 1)] + 
        integralSqSum[(y + 1) * (width + 1) + x] - 
        integralSqSum[y * (width + 1) + x];
    }
  }

  // 2. Local threshold computation
  const halfWindow = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - halfWindow);
      const y1 = Math.max(0, y - halfWindow);
      const x2 = Math.min(width - 1, x + halfWindow);
      const y2 = Math.min(height - 1, y + halfWindow);

      const count = (x2 - x1 + 1) * (y2 - y1 + 1);

      const sum = integralSum[(y2 + 1) * (width + 1) + (x2 + 1)] -
                  integralSum[y1 * (width + 1) + (x2 + 1)] -
                  integralSum[(y2 + 1) * (width + 1) + x1] +
                  integralSum[y1 * (width + 1) + x1];

      const sqSum = integralSqSum[(y2 + 1) * (width + 1) + (x2 + 1)] -
                    integralSqSum[y1 * (width + 1) + (x2 + 1)] -
                    integralSqSum[(y2 + 1) * (width + 1) + x1] +
                    integralSqSum[y1 * (width + 1) + x1];

      const mean = sum / count;
      const variance = (sqSum / count) - (mean * mean);
      const stdDev = Math.sqrt(Math.max(0, variance));

      const threshold = mean * (1 + k * ((stdDev / r) - 1));
      const currentPixel = grayscale[y * width + x];
      const binaryValue = currentPixel < threshold ? 0 : 255;

      const pixelIdx = (y * width + x) * 4;
      data[pixelIdx] = binaryValue;
      data[pixelIdx + 1] = binaryValue;
      data[pixelIdx + 2] = binaryValue;
      data[pixelIdx + 3] = 255;
    }
  }
}
