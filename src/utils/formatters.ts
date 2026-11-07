/**
 * PixelCraft utility functions for formatting file sizes, metrics,
 * and validating image inputs.
 */

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

export function calculateSavings(originalBytes: number, processedBytes: number): {
  savedBytes: number;
  percent: number;
} {
  if (originalBytes <= 0) {
    return { savedBytes: 0, percent: 0 };
  }
  const savedBytes = Math.max(0, originalBytes - processedBytes);
  const percent = Math.round((savedBytes / originalBytes) * 100);
  return { savedBytes, percent };
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function getAspectRatioString(width: number, height: number): string {
  if (!width || !height || width <= 0 || height <= 0) return '1:1';
  const divisor = gcd(Math.round(width), Math.round(height));
  const rw = Math.round(width) / divisor;
  const rh = Math.round(height) / divisor;

  // Common standard ratios normalization for readability
  const ratio = width / height;
  if (Math.abs(ratio - 16 / 9) < 0.03) return '16:9';
  if (Math.abs(ratio - 4 / 3) < 0.03) return '4:3';
  if (Math.abs(ratio - 3 / 2) < 0.03) return '3:2';
  if (Math.abs(ratio - 1) < 0.02) return '1:1';
  if (Math.abs(ratio - 9 / 16) < 0.03) return '9:16';
  if (Math.abs(ratio - 2 / 3) < 0.03) return '2:3';

  if (rw <= 24 && rh <= 24) {
    return `${rw}:${rh}`;
  }
  return `${ratio.toFixed(2)}:1`;
}

export function formatMimeType(mime: string): string {
  if (!mime) return 'IMAGE';
  const parts = mime.split('/');
  const sub = parts[1] || parts[0];
  return sub.toUpperCase().replace('SVG+XML', 'SVG');
}

export function validateImageFile(
  file: File,
  options?: { maxBytes?: number; allowedTypes?: string[] }
): { valid: boolean; error?: string } {
  const maxBytes = options?.maxBytes ?? 50 * 1024 * 1024; // Default 50MB
  const allowed = options?.allowedTypes ?? [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml',
    'image/gif',
  ];

  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum limit is ${formatBytes(maxBytes)}.`,
    };
  }

  if (file.type && !allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type}). Supported formats: JPG, PNG, WEBP, AVIF, SVG, GIF.`,
    };
  }

  return { valid: true };
}
