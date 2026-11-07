import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBytes, calculateSavings, getAspectRatioString, formatMimeType, validateImageFile } from './formatters';

test('formatBytes properly converts values across magnitudes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(500), '500 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(2621440), '2.5 MB');
});

test('calculateSavings returns correct saved bytes and percentage', () => {
  const result = calculateSavings(1000, 250);
  assert.equal(result.savedBytes, 750);
  assert.equal(result.percent, 75);

  const noSavings = calculateSavings(1000, 1000);
  assert.equal(noSavings.savedBytes, 0);
  assert.equal(noSavings.percent, 0);

  const edgeZero = calculateSavings(0, 0);
  assert.equal(edgeZero.savedBytes, 0);
  assert.equal(edgeZero.percent, 0);
});

test('getAspectRatioString recognizes common aspect ratios', () => {
  assert.equal(getAspectRatioString(1920, 1080), '16:9');
  assert.equal(getAspectRatioString(1000, 1000), '1:1');
  assert.equal(getAspectRatioString(800, 600), '4:3');
  assert.equal(getAspectRatioString(1080, 1920), '9:16');
});

test('formatMimeType parses MIME type string', () => {
  assert.equal(formatMimeType('image/png'), 'PNG');
  assert.equal(formatMimeType('image/jpeg'), 'JPEG');
  assert.equal(formatMimeType('image/webp'), 'WEBP');
  assert.equal(formatMimeType('image/svg+xml'), 'SVG');
});

test('validateImageFile checks file size boundaries', () => {
  const fakeSmallFile = {
    size: 1024 * 500,
    type: 'image/png',
    name: 'test.png',
  } as unknown as File;

  const validResult = validateImageFile(fakeSmallFile, { maxBytes: 1024 * 1024 });
  assert.equal(validResult.valid, true);

  const fakeBigFile = {
    size: 1024 * 1024 * 10,
    type: 'image/png',
    name: 'big.png',
  } as unknown as File;

  const invalidResult = validateImageFile(fakeBigFile, { maxBytes: 1024 * 1024 * 5 });
  assert.equal(invalidResult.valid, false);
  assert.match(invalidResult.error || '', /File is too large/);
});
