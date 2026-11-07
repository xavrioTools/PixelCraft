/**
 * PixelCraft Browser-Native ZIP Exporter
 * Packs multiple File/Blob objects into a valid uncompressed (Store) ZIP archive in RAM
 * completely client-side, with CRC-32 checksum calculation.
 */

// Simple CRC-32 Lookup Table
const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c;
}

function calculateCRC32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileEntry {
  filename: string;
  blob: Blob;
}

/**
 * Packs array of Blobs into a ZIP archive Blob and triggers browser download
 */
export async function downloadZipArchive(
  files: ZipFileEntry[],
  zipFilename: string = 'pixelcraft-batch-export.zip'
): Promise<void> {
  if (files.length === 0) return;

  const localHeaderParts: Uint8Array[] = [];
  const centralDirectoryParts: Uint8Array[] = [];

  let currentOffset = 0;
  const encoder = new TextEncoder();

  for (const file of files) {
    const filenameBytes = encoder.encode(file.filename);
    const arrayBuffer = await file.blob.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);
    const crc32 = calculateCRC32(fileBytes);
    const uncompressedSize = fileBytes.length;
    const compressedSize = uncompressedSize; // Store mode (no compression algorithm needed)

    // DOS Date & Time (Default to current time or static 2026 timestamp)
    const dosTime = 0x4800; // 09:00:00
    const dosDate = 0x5d06; // 2026-11-06

    // 1. Local File Header (30 bytes + filename + data)
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const lView = new DataView(localHeader.buffer);

    lView.setUint32(0, 0x04034b50, true); // Local header signature
    lView.setUint16(4, 20, true); // Version needed to extract (2.0)
    lView.setUint16(6, 0, true); // General purpose bit flag
    lView.setUint16(8, 0, true); // Compression method (0 = Store)
    lView.setUint16(10, dosTime, true);
    lView.setUint16(12, dosDate, true);
    lView.setUint32(14, crc32, true);
    lView.setUint32(18, compressedSize, true);
    lView.setUint32(22, uncompressedSize, true);
    lView.setUint16(26, filenameBytes.length, true);
    lView.setUint16(28, 0, true); // Extra field length

    localHeader.set(filenameBytes, 30);

    localHeaderParts.push(localHeader);
    localHeaderParts.push(fileBytes);

    // 2. Central Directory Header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + filenameBytes.length);
    const cView = new DataView(centralHeader.buffer);

    cView.setUint32(0, 0x02014b50, true); // Central header signature
    cView.setUint16(4, 20, true); // Version made by
    cView.setUint16(6, 20, true); // Version needed
    cView.setUint16(8, 0, true); // Bit flag
    cView.setUint16(10, 0, true); // Compression method
    cView.setUint16(12, dosTime, true);
    cView.setUint16(14, dosDate, true);
    cView.setUint32(16, crc32, true);
    cView.setUint32(20, compressedSize, true);
    cView.setUint32(24, uncompressedSize, true);
    cView.setUint16(28, filenameBytes.length, true);
    cView.setUint16(30, 0, true); // Extra field length
    cView.setUint16(32, 0, true); // Comment length
    cView.setUint16(34, 0, true); // Disk number start
    cView.setUint16(36, 0, true); // Internal attributes
    cView.setUint32(38, 0, true); // External attributes
    cView.setUint32(42, currentOffset, true); // Relative offset of local header

    centralHeader.set(filenameBytes, 46);
    centralDirectoryParts.push(centralHeader);

    // Advance offset
    currentOffset += localHeader.length + fileBytes.length;
  }

  // Calculate Central Directory Size
  let centralDirectorySize = 0;
  for (const part of centralDirectoryParts) {
    centralDirectorySize += part.length;
  }

  // 3. End of Central Directory Record (EOCD - 22 bytes)
  const eocd = new Uint8Array(22);
  const eView = new DataView(eocd.buffer);

  eView.setUint32(0, 0x06054b50, true); // EOCD signature
  eView.setUint16(4, 0, true); // Number of this disk
  eView.setUint16(6, 0, true); // Disk where central directory starts
  eView.setUint16(8, files.length, true); // Number of central directory records on this disk
  eView.setUint16(10, files.length, true); // Total number of central directory records
  eView.setUint32(12, centralDirectorySize, true); // Size of central directory
  eView.setUint32(16, currentOffset, true); // Offset of start of central directory
  eView.setUint16(20, 0, true); // Comment length

  // Combine all parts into single ZIP Blob
  const allParts: (Uint8Array | ArrayBuffer)[] = [...localHeaderParts, ...centralDirectoryParts, eocd];
  const zipBlob = new Blob(allParts as unknown as BlobPart[], { type: 'application/zip' });

  // Trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = zipFilename;
  link.click();
}
