import test from 'node:test';
import assert from 'node:assert/strict';

// Pure math & utility functions for image processing

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) || 0;
    const g = parseInt(clean[1] + clean[1], 16) || 0;
    const b = parseInt(clean[2] + clean[2], 16) || 0;
    return [r, g, b];
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return [r, g, b];
}

export function calculateClampedCrop(
  imageWidth: number,
  imageHeight: number,
  crop: { x: number; y: number; width: number; height: number }
) {
  const x = Math.max(0, Math.min(imageWidth - 1, Math.round(crop.x)));
  const y = Math.max(0, Math.min(imageHeight - 1, Math.round(crop.y)));
  const width = Math.max(1, Math.min(imageWidth - x, Math.round(crop.width)));
  const height = Math.max(1, Math.min(imageHeight - y, Math.round(crop.height)));
  return { x, y, width, height };
}

export function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  newWidth: number,
  maintainAspectRatio: boolean
) {
  if (!maintainAspectRatio) {
    return { width: Math.round(newWidth), height: originalHeight };
  }
  const ratio = originalHeight / originalWidth;
  return {
    width: Math.round(newWidth),
    height: Math.round(newWidth * ratio),
  };
}

export function calculatePerceptualColorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114);
}

export function calculateSharpenKernelWeights(amount: number) {
  const a = Math.max(0, Math.min(1, amount));
  const center = 1 + 4 * a;
  const neighbor = -a;
  // Sum of all weights must equal 1 to preserve brightness
  const sum = center + 4 * neighbor;
  return { center, neighbor, sum };
}

export function findDominantCornerColor(corners: [number, number, number][]): [number, number, number] {
  if (corners.length === 0) return [255, 255, 255];
  // Calculate cluster center
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  for (const c of corners) {
    totalR += c[0];
    totalG += c[1];
    totalB += c[2];
  }
  const avgR = Math.round(totalR / corners.length);
  const avgG = Math.round(totalG / corners.length);
  const avgB = Math.round(totalB / corners.length);

  // Return corner closest to cluster average
  let bestDist = Infinity;
  let best = corners[0];
  for (const c of corners) {
    const d = calculatePerceptualColorDistance(c[0], c[1], c[2], avgR, avgG, avgB);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

test('calculateClampedCrop stays strictly inside image boundary', () => {
  const result = calculateClampedCrop(1000, 800, {
    x: -50,
    y: -20,
    width: 1200,
    height: 900,
  });
  assert.equal(result.x, 0);
  assert.equal(result.y, 0);
  assert.equal(result.width, 1000);
  assert.equal(result.height, 800);
});

test('calculateTargetDimensions scales proportionately when aspect locked', () => {
  const result = calculateTargetDimensions(1920, 1080, 960, true);
  assert.equal(result.width, 960);
  assert.equal(result.height, 540);
});

test('calculatePerceptualColorDistance handles backdrop thresholds accurately', () => {
  const exact = calculatePerceptualColorDistance(255, 255, 255, 255, 255, 255);
  assert.equal(exact, 0);

  const whiteVsSoftWhite = calculatePerceptualColorDistance(255, 255, 255, 245, 245, 245);
  assert.ok(whiteVsSoftWhite < 15);

  const chromaGreen = calculatePerceptualColorDistance(0, 255, 0, 50, 240, 50);
  assert.ok(chromaGreen < 50);

  const blackVsWhite = calculatePerceptualColorDistance(0, 0, 0, 255, 255, 255);
  assert.ok(blackVsWhite > 200);
});

test('hexToRgb correctly parses hex codes with and without hash', () => {
  assert.deepEqual(hexToRgb('#ffffff'), [255, 255, 255]);
  assert.deepEqual(hexToRgb('00ff00'), [0, 255, 0]);
  assert.deepEqual(hexToRgb('#6366f1'), [99, 102, 241]);
  assert.deepEqual(hexToRgb('#000'), [0, 0, 0]);
  assert.deepEqual(hexToRgb('#fff'), [255, 255, 255]);
});

test('calculateSharpenKernelWeights preserves total luminosity sum of 1', () => {
  const weights = calculateSharpenKernelWeights(0.25);
  assert.equal(weights.center, 2.0);
  assert.equal(weights.neighbor, -0.25);
  assert.equal(Math.round(weights.sum), 1);
});

test('findDominantCornerColor filters outliers and selects true backdrop color', () => {
  // 3 white corners, 1 dark corner (e.g. subject touched bottom corner)
  const corners: [number, number, number][] = [
    [255, 255, 255],
    [250, 250, 250],
    [248, 248, 252],
    [20, 30, 40], // subject foot/corner
  ];
  const dominant = findDominantCornerColor(corners);
  // Dominant should be near white, not dark
  assert.ok(dominant[0] > 200);
  assert.ok(dominant[1] > 200);
  assert.ok(dominant[2] > 200);
});
