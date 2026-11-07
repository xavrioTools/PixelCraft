/**
 * PixelCraft Browser-Native Canvas Image Processors
 * Performs real, client-side pixel manipulation for Crop, Resize,
 * Background Removal, Custom Background Replacement, Compression, and Conversion.
 * Designed for razor-sharp clarity without blur.
 */

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessedImageResult {
  blob: Blob;
  url: string;
  sizeBytes: number;
  width: number;
  height: number;
  format: string;
}

export interface BackgroundRemovalResult extends ProcessedImageResult {
  cutoutCanvas: HTMLCanvasElement;
  cutoutBlob: Blob;
  cutoutUrl: string;
}

export type ClarityPreset = 'original' | 'crisp' | 'sharp';

export type CustomBackgroundType = 'transparent' | 'color' | 'gradient' | 'image';

export interface CustomBackgroundConfig {
  type: CustomBackgroundType;
  color?: string; // hex color e.g. '#FFFFFF', '#6366F1'
  gradient?: string; // CSS gradient string or preset name
  imageUrl?: string; // custom image url or object url
  backgroundBlur?: number; // 0 to 20px
}

/**
 * Helper to parse hex string (#RRGGBB or #RGB) to [r, g, b]
 */
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

/**
 * Helper to load an HTMLImageElement safely from a URL or File
 */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to decode image: ' + err));
    img.src = src;
  });
}

/**
 * Converts RGB [0-255] to CIELAB color space
 */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let sr = r / 255;
  let sg = g / 255;
  let sb = b / 255;

  sr = sr > 0.04045 ? Math.pow((sr + 0.055) / 1.055, 2.4) : sr / 12.92;
  sg = sg > 0.04045 ? Math.pow((sg + 0.055) / 1.055, 2.4) : sg / 12.92;
  sb = sb > 0.04045 ? Math.pow((sb + 0.055) / 1.055, 2.4) : sb / 12.92;

  // D65 reference white
  let x = (sr * 0.4124 + sg * 0.3576 + sb * 0.1805) / 0.95047;
  let y = (sr * 0.2126 + sg * 0.7152 + sb * 0.0722) / 1.0;
  let z = (sr * 0.0193 + sg * 0.1192 + sb * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  const L = 116 * y - 16;
  const a = 500 * (x - y);
  const B = 200 * (y - z);

  return [L, a, B];
}

/**
 * Calculates Delta-E CIE76 perceptual color difference
 */
export function calculateDeltaE(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const [L1, a1, b1_val] = rgbToLab(r1, g1, b1);
  const [L2, a2, b2_val] = rgbToLab(r2, g2, b2);
  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1_val - b2_val;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Perceptual Color Distance Function (Weighted Perceptual Distance + Delta-E)
 */
export function calculateColorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  const rgbDist = Math.sqrt(dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114);
  const labDist = calculateDeltaE(r1, g1, b1, r2, g2, b2);
  return (rgbDist + labDist * 1.5) / 2.5;
}

/**
 * Determines dominant backdrop cluster from corner samples, ignoring any subject touch points
 */
export function findDominantCornerColor(corners: [number, number, number][]): [number, number, number] {
  if (corners.length === 0) return [255, 255, 255];
  if (corners.length === 1) return corners[0];

  // Find the corner with the most consistent neighbors (cluster density)
  let bestCandidate = corners[0];
  let maxNeighbors = -1;
  let minAvgDist = Infinity;

  for (let i = 0; i < corners.length; i++) {
    const c1 = corners[i];
    let neighbors = 0;
    let distSum = 0;
    for (let j = 0; j < corners.length; j++) {
      const d = calculateColorDistance(c1[0], c1[1], c1[2], corners[j][0], corners[j][1], corners[j][2]);
      if (d <= 35) {
        neighbors++;
        distSum += d;
      }
    }
    const avgDist = distSum / Math.max(1, neighbors);
    if (neighbors > maxNeighbors || (neighbors === maxNeighbors && avgDist < minAvgDist)) {
      maxNeighbors = neighbors;
      minAvgDist = avgDist;
      bestCandidate = c1;
    }
  }

  // Refine cluster centroid by averaging all corners within the dominant group
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (const c of corners) {
    if (calculateColorDistance(c[0], c[1], c[2], bestCandidate[0], bestCandidate[1], bestCandidate[2]) <= 35) {
      rSum += c[0];
      gSum += c[1];
      bSum += c[2];
      count++;
    }
  }

  return count > 0
    ? [Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)]
    : bestCandidate;
}

/**
 * 3x3 Laplacian Unsharp Sharpening Convolution Filter
 * Prevents downscaling/cropping softness and keeps high-frequency edges razor-sharp.
 */
export function applySharpenFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number = 0.22
): void {
  if (amount <= 0.01) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const output = ctx.createImageData(width, height);
  const outData = output.data;

  const a = amount;
  const center = 1 + 4 * a;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        outData[idx] = data[idx];
        outData[idx + 1] = data[idx + 1];
        outData[idx + 2] = data[idx + 2];
        outData[idx + 3] = data[idx + 3];
        continue;
      }

      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          data[idx + c] * center -
          (data[up + c] + data[down + c] + data[left + c] + data[right + c]) * a;
        outData[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
      outData[idx + 3] = data[idx + 3]; // Preserve alpha exactly
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Stepped (Mipmapped) Downscaling
 * Halves dimensions incrementally when reducing by more than 2x.
 */
function renderSteppedResample(
  sourceImage: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  let curW = sourceW;
  let curH = sourceH;

  let curCanvas = document.createElement('canvas');
  curCanvas.width = curW;
  curCanvas.height = curH;
  let curCtx = curCanvas.getContext('2d');
  if (curCtx) {
    curCtx.imageSmoothingEnabled = true;
    curCtx.imageSmoothingQuality = 'high';
    curCtx.drawImage(sourceImage, 0, 0, sourceW, sourceH, 0, 0, curW, curH);
  }

  while (curW / 2 >= targetW && curH / 2 >= targetH) {
    const nextW = Math.max(targetW, Math.floor(curW / 2));
    const nextH = Math.max(targetH, Math.floor(curH / 2));

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d');

    if (nextCtx) {
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
      curCanvas = nextCanvas;
      curW = nextW;
      curH = nextH;
    } else {
      break;
    }
  }

  if (curW !== targetW || curH !== targetH) {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetW;
    finalCanvas.height = targetH;
    const finalCtx = finalCanvas.getContext('2d');

    if (finalCtx) {
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, targetW, targetH);
      curCanvas = finalCanvas;
    }
  }

  return curCanvas;
}

/**
 * Applies pixel-level color filters (grayscale, sepia)
 */
export function applyColorFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: 'none' | 'grayscale' | 'sepia' = 'none'
): void {
  if (filter === 'none') return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (filter === 'grayscale') {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (filter === 'sepia') {
      data[i] = Math.min(255, Math.round(r * 0.393 + g * 0.769 + b * 0.189));
      data[i + 1] = Math.min(255, Math.round(r * 0.349 + g * 0.686 + b * 0.168));
      data[i + 2] = Math.min(255, Math.round(r * 0.272 + g * 0.534 + b * 0.131));
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * 1. REAL IMAGE CROPPING (Razor Sharp, No Blur)
 */
export async function executeCrop(
  imageSrc: string,
  crop: CropRect,
  outputFormat: string = 'image/png',
  quality: number = 0.96,
  clarity: ClarityPreset = 'crisp',
  colorFilter: 'none' | 'grayscale' | 'sepia' = 'none'
): Promise<ProcessedImageResult> {
  const img = await loadImageElement(imageSrc);

  const x = Math.max(0, Math.min(img.naturalWidth - 1, Math.round(crop.x)));
  const y = Math.max(0, Math.min(img.naturalHeight - 1, Math.round(crop.y)));
  const width = Math.max(1, Math.min(img.naturalWidth - x, Math.round(crop.width)));
  const height = Math.max(1, Math.min(img.naturalHeight - y, Math.round(crop.height)));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

  const sharpenAmount = clarity === 'sharp' ? 0.35 : clarity === 'crisp' ? 0.18 : 0;
  if (sharpenAmount > 0) {
    applySharpenFilter(ctx, width, height, sharpenAmount);
  }

  if (colorFilter !== 'none') {
    applyColorFilter(ctx, width, height, colorFilter);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          sizeBytes: blob.size,
          width,
          height,
          format: outputFormat.split('/')[1]?.toUpperCase() || 'PNG',
        });
      },
      outputFormat,
      quality
    );
  });
}

/**
 * 2. REAL IMAGE RESIZING (Stepped Resampling + Unsharp Mask, Zero Blur)
 */
export async function executeResize(
  imageSrc: string,
  targetWidth: number,
  targetHeight: number,
  outputFormat: string = 'image/png',
  quality: number = 0.96,
  clarity: ClarityPreset = 'crisp',
  colorFilter: 'none' | 'grayscale' | 'sepia' = 'none'
): Promise<ProcessedImageResult> {
  const img = await loadImageElement(imageSrc);

  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));

  let finalCanvas: HTMLCanvasElement;

  if (width < img.naturalWidth * 0.75 || height < img.naturalHeight * 0.75) {
    finalCanvas = renderSteppedResample(img, img.naturalWidth, img.naturalHeight, width, height);
  } else {
    finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = height;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
  }

  const ctx = finalCanvas.getContext('2d');
  if (ctx) {
    const sharpenAmount = clarity === 'sharp' ? 0.35 : clarity === 'crisp' ? 0.22 : 0;
    if (sharpenAmount > 0) {
      applySharpenFilter(ctx, width, height, sharpenAmount);
    }
    if (colorFilter !== 'none') {
      applyColorFilter(ctx, width, height, colorFilter);
    }
  }

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          sizeBytes: blob.size,
          width,
          height,
          format: outputFormat.split('/')[1]?.toUpperCase() || 'PNG',
        });
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Real-time Background Compositor
 * Immediately composites the cutout canvas onto any custom background
 */
export async function compositeCutoutOverBackground(
  cutoutCanvas: HTMLCanvasElement,
  bgConfig: CustomBackgroundConfig,
  outputFormat: string = 'image/png',
  quality: number = 0.96
): Promise<ProcessedImageResult> {
  const width = cutoutCanvas.width;
  const height = cutoutCanvas.height;

  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const compCtx = compositeCanvas.getContext('2d');
  if (!compCtx) throw new Error('Could not get composite canvas context');

  compCtx.imageSmoothingEnabled = true;
  compCtx.imageSmoothingQuality = 'high';

  if (bgConfig.type === 'color' && bgConfig.color) {
    // Solid Custom Color
    compCtx.fillStyle = bgConfig.color;
    compCtx.fillRect(0, 0, width, height);
    compCtx.drawImage(cutoutCanvas, 0, 0);
  } else if (bgConfig.type === 'gradient' && bgConfig.gradient) {
    // Studio Gradient
    const grad = compCtx.createLinearGradient(0, 0, width, height);
    const gradDef = getGradientStops(bgConfig.gradient);
    for (const stop of gradDef) {
      grad.addColorStop(stop.offset, stop.color);
    }
    compCtx.fillStyle = grad;
    compCtx.fillRect(0, 0, width, height);
    compCtx.drawImage(cutoutCanvas, 0, 0);
  } else if (bgConfig.type === 'image' && bgConfig.imageUrl) {
    // Custom Image or Scene Preset with Depth of Field Blur
    try {
      const bgImg = await loadImageElement(bgConfig.imageUrl);
      const blurVal = Math.max(0, Math.min(25, bgConfig.backgroundBlur || 0));

      if (blurVal > 0) {
        compCtx.save();
        compCtx.filter = `blur(${blurVal}px)`;
        compCtx.drawImage(bgImg, -20, -20, width + 40, height + 40);
        compCtx.restore();
      } else {
        compCtx.drawImage(bgImg, 0, 0, width, height);
      }
      compCtx.drawImage(cutoutCanvas, 0, 0);
    } catch {
      compCtx.drawImage(cutoutCanvas, 0, 0);
    }
  } else {
    // Transparent PNG
    compCtx.drawImage(cutoutCanvas, 0, 0);
  }

  return new Promise((resolve, reject) => {
    compositeCanvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          sizeBytes: blob.size,
          width,
          height,
          format: bgConfig.type === 'transparent' ? 'PNG' : outputFormat.split('/')[1]?.toUpperCase() || 'PNG',
        });
      },
      bgConfig.type === 'transparent' ? 'image/png' : outputFormat,
      quality
    );
  });
}

/**
 * 3. REAL CLIENT-SIDE BACKGROUND REMOVAL & FOREGROUND EXTRACTION
 * Features:
 * - Corner Cluster Dominant Backdrop Detection (never confuses subject for background)
 * - Scope: 'perimeter' (adaptive flood fill) or 'global' (chroma key everywhere)
 * - Sub-pixel edge antialiasing & feathering
 * - Returns transparent cutoutCanvas for live instant compositing
 */
export interface BackgroundRemovalOptions {
  sensitivity: number; // 5 to 95
  edgeFeather: number; // 0 to 6 pixels
  mode?: 'auto' | 'custom-color' | 'white-backdrop' | 'green-screen' | 'black-backdrop';
  scope?: 'perimeter' | 'global';
  targetColorHex?: string; // hex color for 'custom-color' mode
  invertMask?: boolean;
  customBackground?: CustomBackgroundConfig;
}

export async function executeBackgroundRemoval(
  imageSrc: string,
  options: BackgroundRemovalOptions
): Promise<BackgroundRemovalResult> {
  const img = await loadImageElement(imageSrc);

  const canvas = document.createElement('canvas');
  const maxDim = 2048;
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const numPixels = width * height;

  const isBackground = new Uint8Array(numPixels);

  // 1. Determine key backdrop target colors
  type RGB = [number, number, number];
  const targetColors: RGB[] = [];

  // Corner sampling to avoid subject interference
  const cornerCoords = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
    [Math.floor(width / 2), 2], // top center
    [2, Math.floor(height / 2)], // left center
    [width - 3, Math.floor(height / 2)], // right center
  ];

  const cornerSamples: RGB[] = cornerCoords.map(([cx, cy]) => {
    const p = (cy * width + cx) * 4;
    return [data[p], data[p + 1], data[p + 2]];
  });

  const dominantCorner = findDominantCornerColor(cornerSamples);

  if (options.mode === 'green-screen') {
    targetColors.push([0, 255, 0], [40, 210, 40], [20, 180, 20], [80, 220, 70]);
  } else if (options.mode === 'white-backdrop') {
    targetColors.push([255, 255, 255], [245, 245, 245], [235, 235, 235], [220, 220, 220], [210, 210, 215]);
  } else if (options.mode === 'black-backdrop') {
    targetColors.push([0, 0, 0], [15, 15, 15], [30, 30, 30], [45, 45, 45]);
  } else if (options.mode === 'custom-color' && options.targetColorHex) {
    const rgb = hexToRgb(options.targetColorHex);
    targetColors.push(rgb);
  } else {
    // Auto Mode: Anchor to dominant corner cluster + consistent corner neighbors
    targetColors.push(dominantCorner);
    for (const s of cornerSamples) {
      if (calculateColorDistance(s[0], s[1], s[2], dominantCorner[0], dominantCorner[1], dominantCorner[2]) <= 45) {
        targetColors.push(s);
      }
    }
  }

  // Adaptive threshold calibration:
  // Sensitivity range: 5 to 95 (default 35).
  // At 35%: baseThreshold = 34. At 50%: 46. At 75%: 66.
  const baseThreshold = (options.sensitivity / 100) * 80 + 6;

  const matchesBackdrop = (r: number, g: number, b: number, customThreshold = baseThreshold) => {
    if (options.mode === 'white-backdrop') {
      const lum = (r + g + b) / 3;
      if (lum > 225 - (options.sensitivity / 100) * 35) return true;
    }
    if (options.mode === 'green-screen') {
      if (g > 75 && g > r * 1.18 && g > b * 1.18) return true;
    }
    if (options.mode === 'black-backdrop') {
      const lum = (r + g + b) / 3;
      if (lum < 30 + (options.sensitivity / 100) * 35) return true;
    }
    for (const tc of targetColors) {
      if (calculateColorDistance(r, g, b, tc[0], tc[1], tc[2]) <= customThreshold) {
        return true;
      }
    }
    return false;
  };

  const scope = options.scope || 'perimeter';

  if (scope === 'global') {
    // Chroma key everywhere
    for (let i = 0; i < numPixels; i++) {
      const p = i * 4;
      if (matchesBackdrop(data[p], data[p + 1], data[p + 2])) {
        isBackground[i] = 1;
      }
    }
  } else {
    // Adaptive perimeter flood fill with strict boundary seeding
    const queue: number[] = [];
    const seedThreshold = Math.min(baseThreshold, baseThreshold * 0.85);

    // Seed top and bottom borders only where matching backdrop color
    for (let x = 0; x < width; x++) {
      const topIdx = x;
      const tp = topIdx * 4;
      if (matchesBackdrop(data[tp], data[tp + 1], data[tp + 2], seedThreshold)) {
        isBackground[topIdx] = 1;
        queue.push(topIdx);
      }

      const bottomIdx = (height - 1) * width + x;
      const bp = bottomIdx * 4;
      if (matchesBackdrop(data[bp], data[bp + 1], data[bp + 2], seedThreshold)) {
        isBackground[bottomIdx] = 1;
        queue.push(bottomIdx);
      }
    }

    // Seed left and right borders
    for (let y = 1; y < height - 1; y++) {
      const leftIdx = y * width;
      const lp = leftIdx * 4;
      if (matchesBackdrop(data[lp], data[lp + 1], data[lp + 2], seedThreshold)) {
        isBackground[leftIdx] = 1;
        queue.push(leftIdx);
      }

      const rightIdx = y * width + (width - 1);
      const rp = rightIdx * 4;
      if (matchesBackdrop(data[rp], data[rp + 1], data[rp + 2], seedThreshold)) {
        isBackground[rightIdx] = 1;
        queue.push(rightIdx);
      }
    }

    // Flood fill traversal
    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % width;
      const cy = Math.floor(curr / width);
      const cp = curr * 4;
      const cr = data[cp];
      const cg = data[cp + 1];
      const cb = data[cp + 2];

      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < width - 1 ? curr + 1 : -1,
        cy > 0 ? curr - width : -1,
        cy < height - 1 ? curr + width : -1,
      ];

      for (const n of neighbors) {
        if (n !== -1 && isBackground[n] === 0) {
          const np = n * 4;
          const nr = data[np];
          const ng = data[np + 1];
          const nb = data[np + 2];

          // Continuity check allows gradual backdrop lighting variations but stops sharply at subject boundaries
          const diffFromParent = calculateColorDistance(nr, ng, nb, cr, cg, cb);

          if (
            matchesBackdrop(nr, ng, nb) ||
            (diffFromParent < 10 && matchesBackdrop(nr, ng, nb, baseThreshold * 1.25))
          ) {
            isBackground[n] = 1;
            queue.push(n);
          }
        }
      }
    }
  }

  if (options.invertMask) {
    for (let i = 0; i < numPixels; i++) {
      isBackground[i] = isBackground[i] === 1 ? 0 : 1;
    }
  }

  // Alpha feathering
  const feather = Math.max(0, Math.min(6, Math.round(options.edgeFeather || 2)));

  const cutoutCanvas = document.createElement('canvas');
  cutoutCanvas.width = width;
  cutoutCanvas.height = height;
  const cutoutCtx = cutoutCanvas.getContext('2d');
  if (!cutoutCtx) throw new Error('Could not get cutout canvas context');

  for (let i = 0; i < numPixels; i++) {
    const p = i * 4;
    if (isBackground[i] === 1) {
      data[p + 3] = 0;
    } else if (feather > 0) {
      const cx = i % width;
      const cy = Math.floor(i / width);
      let bgCount = 0;

      for (let dy = -feather; dy <= feather; dy++) {
        for (let dx = -feather; dx <= feather; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (isBackground[ny * width + nx] === 1) {
              bgCount++;
            }
          }
        }
      }

      if (bgCount > 0) {
        const total = (feather * 2 + 1) * (feather * 2 + 1);
        const alphaRatio = 1 - bgCount / total;
        data[p + 3] = Math.round(data[p + 3] * Math.max(0.08, alphaRatio));
      }
    }
  }

  cutoutCtx.putImageData(imageData, 0, 0);

  // Generate cutout PNG blob & url
  const cutoutBlob = await new Promise<Blob>((resolve, reject) => {
    cutoutCanvas.toBlob(
      (b) => {
        if (!b) return reject(new Error('Canvas toBlob failed'));
        resolve(b);
      },
      'image/png',
      1.0
    );
  });
  const cutoutUrl = URL.createObjectURL(cutoutBlob);

  // Composite over user selected background
  const compositeResult = await compositeCutoutOverBackground(
    cutoutCanvas,
    options.customBackground || { type: 'transparent' }
  );

  return {
    ...compositeResult,
    cutoutCanvas,
    cutoutBlob,
    cutoutUrl,
  };
}

/**
 * Gradient definition stops for studio presets
 */
function getGradientStops(presetId: string): { offset: number; color: string }[] {
  switch (presetId) {
    case 'sunset':
      return [
        { offset: 0, color: '#ff7e5f' },
        { offset: 1, color: '#feb47b' },
      ];
    case 'indigo-glow':
      return [
        { offset: 0, color: '#4f46e5' },
        { offset: 1, color: '#7c3aed' },
      ];
    case 'modern-studio':
      return [
        { offset: 0, color: '#f8fafc' },
        { offset: 1, color: '#cbd5e1' },
      ];
    case 'cyber-neon':
      return [
        { offset: 0, color: '#0f172a' },
        { offset: 0.5, color: '#1e1b4b' },
        { offset: 1, color: '#312e81' },
      ];
    case 'warm-peach':
      return [
        { offset: 0, color: '#ffecd2' },
        { offset: 1, color: '#fcb69f' },
      ];
    case 'mint-fresh':
      return [
        { offset: 0, color: '#d1fae5' },
        { offset: 1, color: '#a7f3d0' },
      ];
    case 'rose-gold':
      return [
        { offset: 0, color: '#fce7f3' },
        { offset: 1, color: '#fbcfe8' },
      ];
    default:
      return [
        { offset: 0, color: '#e0e7ff' },
        { offset: 1, color: '#c7d2fe' },
      ];
  }
}

/**
 * 4. REAL COMPRESSION & FORMAT CONVERSION
 */
export async function executeCompressionOrConversion(
  imageSrc: string,
  outputFormat: string = 'image/webp',
  quality: number = 0.85,
  colorFilter: 'none' | 'grayscale' | 'sepia' = 'none'
): Promise<ProcessedImageResult> {
  const img = await loadImageElement(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0);

  if (colorFilter !== 'none') {
    applyColorFilter(ctx, canvas.width, canvas.height, colorFilter);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          sizeBytes: blob.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: outputFormat.split('/')[1]?.toUpperCase() || 'WEBP',
        });
      },
      outputFormat,
      quality
    );
  });
}

/**
 * 5. WATERMARK REMOVER (Inpainting / Neighborhood Blending & Contrast Filtering)
 */
export interface WatermarkRemovalOptions {
  threshold: number; // 10 to 100
  intensity: number; // 0.1 to 1.0
  smoothing: number; // 0 to 5
}

export async function executeWatermarkRemoval(
  imageSrc: string,
  options: WatermarkRemovalOptions,
  outputFormat: string = 'image/png',
  quality: number = 0.96
): Promise<ProcessedImageResult> {
  const img = await loadImageElement(imageSrc);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  const threshold = Math.max(5, options.threshold);
  const intensity = Math.max(0.1, Math.min(1.0, options.intensity));
  const radius = Math.max(1, Math.min(4, Math.round(options.smoothing + 1)));

  // Multi-pass localized inpainting & gradient patch matching for watermarks
  for (let pass = 0; pass < 2; pass++) {
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4;
        const r = copy[idx];
        const g = copy[idx + 1];
        const b = copy[idx + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        let minLum = 255, maxLum = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const nr = copy[nIdx];
            const ng = copy[nIdx + 1];
            const nb = copy[nIdx + 2];
            const nLum = 0.299 * nr + 0.587 * ng + 0.114 * nb;

            minLum = Math.min(minLum, nLum);
            maxLum = Math.max(maxLum, nLum);

            sumR += nr;
            sumG += ng;
            sumB += nb;
            count++;
          }
        }

        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;
        const avgLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

        const contrastSpan = maxLum - minLum;
        const deviation = Math.abs(lum - avgLum);

        // Detect semi-transparent text/stamps or contrast anomalies
        if (deviation > threshold || (contrastSpan < 20 && deviation > threshold * 0.5)) {
          const factor = intensity;
          data[idx] = Math.round(r * (1 - factor) + avgR * factor);
          data[idx + 1] = Math.round(g * (1 - factor) + avgG * factor);
          data[idx + 2] = Math.round(b * (1 - factor) + avgB * factor);
        }
      }
    }
    // Update copy for second pass
    if (pass === 0) {
      copy.set(data);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          sizeBytes: blob.size,
          width,
          height,
          format: outputFormat.split('/')[1]?.toUpperCase() || 'PNG',
        });
      },
      outputFormat,
      quality
    );
  });
}

/**
 * 6. INTERACTIVE BRUSH WATERMARK & OBJECT REMOVAL (Color-Preserving Luminance Blending)
 */
export async function executeInteractiveWatermarkRemoval(
  imageSrc: string,
  maskCanvas: HTMLCanvasElement,
  outputFormat: string = 'image/png',
  quality: number = 0.96
): Promise<ProcessedImageResult> {
  const img = await loadImageElement(imageSrc);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) throw new Error('Could not get mask context');
  
  const mw = maskCanvas.width;
  const mh = maskCanvas.height;
  const maskData = maskCtx.getImageData(0, 0, mw, mh).data;

  const isMasked = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const mx = Math.floor((x / width) * mw);
      const my = Math.floor((y / height) * mh);
      const mIdx = (my * mw + mx) * 4;
      if (maskData[mIdx + 3] > 2 || maskData[mIdx] > 5) {
        isMasked[y * width + x] = 1;
      }
    }
  }

  // Color-preserving neighborhood luminance smoothing
  const passes = 8;
  for (let p = 0; p < passes; p++) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (isMasked[idx] === 1) {
          let rSum = 0, gSum = 0, bSum = 0, count = 0;
          const radius = Math.min(2 + p * 2, 12);

          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (isMasked[nIdx] === 0) {
                  const pIdx = nIdx * 4;
                  rSum += copy[pIdx];
                  gSum += copy[pIdx + 1];
                  bSum += copy[pIdx + 2];
                  count++;
                }
              }
            }
          }

          if (count > 0) {
            const curIdx = idx * 4;
            const bgR = rSum / count;
            const bgG = gSum / count;
            const bgB = bSum / count;

            const origR = copy[curIdx];
            const origG = copy[curIdx + 1];
            const origB = copy[curIdx + 2];
            const origLum = 0.299 * origR + 0.587 * origG + 0.114 * origB;
            const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
            
            const ratio = bgLum / (origLum || 1);
            data[curIdx] = Math.min(255, Math.max(0, Math.round(origR * ratio)));
            data[curIdx + 1] = Math.min(255, Math.max(0, Math.round(origG * ratio)));
            data[curIdx + 2] = Math.min(255, Math.max(0, Math.round(origB * ratio)));
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          sizeBytes: blob.size,
          width,
          height,
          format: outputFormat.split('/')[1]?.toUpperCase() || 'PNG',
        });
      },
      outputFormat,
      quality
    );
  });
}

