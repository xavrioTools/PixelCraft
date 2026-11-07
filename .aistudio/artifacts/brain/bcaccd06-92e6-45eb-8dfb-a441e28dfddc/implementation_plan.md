# PixelCraft Batch Processing Engine

A high-performance, client-side batch editing and processing studio for PixelCraft. Enables creators to upload multiple images simultaneously, apply uniform or per-file editing parameters across any PixelCraft tool (Converter, Compressor, Resizer, Cropper, Background Remover), preview queue progress in real-time, and download individual results or a single consolidated ZIP archive.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product & UX choices were confirmed during Phase 1 clarification:

- **Confirmed Integration Workflow**: Dedicated Batch Processing Mode accessible via `/batch` and via a "Batch Mode" toggle in every tool workspace, featuring a multi-file drop zone, tool selector dropdown/tabs, and a persistent bulk execution bar.
- **Confirmed Parameter Application**: Unified Settings model allowing global controls (e.g., target format, quality %, scale ratio, background replacement theme) to apply across all queued images at once, with expandable individual per-file override controls.
- **Confirmed Download & Export**: Consolidated ZIP package export (using a browser-native client-side ZIP generator) containing all processed files with custom naming templates, alongside individual download buttons for each queue item.

---

## 1. Overview & Core Concept

- **What It Does**: Allows users to select or drag-and-drop multiple images (up to 50 files simultaneously), configure tool settings once (or per file), run parallel in-memory HTML5 Canvas processing with individual progress indicators, inspect before/after comparisons in a batch grid, and export everything in one click.
- **Target Audience / Persona**: E-commerce sellers preparing product catalogs, photographers resizing shoot galleries, marketers batch-converting images to WebP/AVIF for Core Web Vitals, and web developers optimizing multi-asset projects.
- **Key Value**: Eliminates repetitive single-file editing cycles, saving up to 90% of editing time while maintaining 100% in-browser privacy (zero server uploads).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Multi-File Upload & Queue Initialization**:
   - Drag-and-drop multiple files (or folder selection) onto the drop zone or click "Try Batch Sample Set" to load a 4-photo test queue instantly.
   - Files populate a responsive batch queue grid displaying thumbnail previews, file names, dimensions, format tags, and status badges (`Ready`, `Processing`, `Completed`, `Error`).
2. **Tool Selection & Global Parameter Tuning**:
   - Select the target operation: **Batch Convert**, **Batch Compress**, **Batch Resize**, **Batch Crop**, or **Batch Background Remover**.
   - Global Parameter Bar updates dynamically with tool-specific controls:
     - *Converter*: Target format (WEBP, PNG, JPG, AVIF) & compression quality.
     - *Compressor*: Quality slider (10% to 100%) with instant payload reduction estimate.
     - *Resizer*: Target max width/height or scaling percentage (25%, 50%, 75%, 200%) + lock aspect ratio.
     - *Cropper*: Aspect ratio preset (1:1, 16:9, 4:3, 9:16) + clarity filter.
     - *Background Remover*: Detection scope, sensitivity slider, and custom background replacer (Transparent, Solid Color, Studio Gradient, or Custom Photo).
3. **Queue Execution & Live Monitoring**:
   - Click "Process All [N] Images". Progress bar fills smoothly as web workers / canvas contexts process items concurrently with a concurrency limit of 4 to keep UI responsive.
   - Individual item cards show real-time status spinners, completed badges, and output file sizes.
4. **Inspection & Download**:
   - Switch between Grid View and List View.
   - Click any queue item to open a quick modal before/after inspection preview.
   - Click "Download ZIP Archive" to get a single `.zip` file containing all optimized assets, or use individual item download buttons.

### Visual Identity & Theme

- **Aesthetic Direction**: Utilitarian, high-density SaaS studio layout adhering to PixelCraft design tokens. Slate/Indigo color palette with high-contrast status feedback.
- **Color Palette**:
  - Dominant Canvas: `bg-slate-50 dark:bg-slate-950`
  - Structural Cards: `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`
  - Accent Controls: `bg-indigo-600 text-white hover:bg-indigo-700`
  - Status Indicators: Emerald for `Completed`, Indigo for `Processing`, Rose for `Error`.
- **Typography & Hierarchy**:
  - Display: `Plus Jakarta Sans` for section headings and tool mode tabs.
  - Tabular Data & Metrics: `tabular-nums font-mono` for pixel dimensions, file size calculations, and compression savings percentages.
- **Component Styling & Layout**:
  - Top Bar Contract: Brand wordmark on left, main navigation links in center, theme switcher and Explore Tools CTA on right.
  - No decorative code comments (`//`), no static pill capsules, no pulsing green dots.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dedicated Route (`/batch`) + Per-Tool Batch Toggle**:
  - *Chosen Approach*: Provide a full `/batch` view in top navigation and tools directory, plus a quick "Switch to Batch Mode" button inside individual tool detail views.
  - *Why*: Gives power users a centralized multi-file workspace while making batch processing discoverable from single-tool pages.
- **Decision 2: Concurrency-Limited Execution Queue**:
  - *Chosen Approach*: Process queued images using an async queue with max 4 parallel canvas executions.
  - *Why*: Prevents browser RAM exhaustion or canvas context loss when processing 20+ high-resolution camera photos at once.
- **Decision 3: Zero-Dependency Client-Side ZIP Generation**:
  - *Chosen Approach*: Implement a lightweight client-side ZIP packager (or bundle `jszip` via standard import) to construct uncompressed/deflated ZIP archives directly from Canvas blobs.
  - *Why*: Enables instant 1-click batch downloads without any backend server endpoints or external network calls.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PixelCraft Router                                    │
│                     (/batch, /convert, /compress, /resize, etc.)                       │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Batch Processing View                                  │
│                 (BatchView.tsx / ToolDetailView Batch Mode Toggle)                      │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│  Multi-File Drop Zone             │  Global Parameter Control Bar                      │
│  (FileUpload multi-file support)  │  (Tool Selector + Unified Controls + Overrides)    │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Batch Concurrency Executor                                │
│                     (queueProcessor.ts - Max 4 Concurrent Workers)                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Item 1: executeCrop / executeResize / executeBackgroundRemoval / executeCompress      │
│  Item 2: executeCrop / executeResize / executeBackgroundRemoval / executeCompress      │
│  Item 3: executeCrop / executeResize / executeBackgroundRemoval / executeCompress      │
│  Item 4: executeCrop / executeResize / executeBackgroundRemoval / executeCompress      │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Batch Results Store & Exporter                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  • Individual Item Previews (ImagePreview modal)                                       │
│  • Per-file Download Buttons (blob URLs)                                               │
│  • Client-Side ZIP Packager (generateBatchZip -> pixelcraft-batch.zip)                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

```typescript
export interface BatchItem {
  id: string;
  file: File;
  originalUrl: string;
  name: string;
  originalSizeBytes: number;
  width: number;
  height: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  processedResult?: ProcessedImageResult;
  overrideConfig?: Partial<BatchToolConfig>;
}

export interface BatchToolConfig {
  toolId: 'convert' | 'compress' | 'resize' | 'crop' | 'background-remover';
  format: 'WEBP' | 'PNG' | 'JPG' | 'AVIF';
  quality: number; // 0.1 to 1.0
  resizeMode: 'scale' | 'dimensions';
  scalePercent: number; // 25, 50, 75, 100, 200
  targetWidth?: number;
  targetHeight?: number;
  maintainAspectRatio: boolean;
  cropRatio: 'free' | '1:1' | '16:9' | '4:3' | '9:16';
  clarityPreset: 'original' | 'crisp' | 'sharp';
  bgMode: 'auto' | 'custom-color' | 'white-backdrop' | 'green-screen' | 'black-backdrop';
  bgScope: 'perimeter' | 'global';
  bgSensitivity: number;
  bgFeather: number;
  bgReplacerTab: 'transparent' | 'color' | 'gradient' | 'image';
  customBgColor: string;
  customBgGradient: string;
  customBgImageUrl?: string;
  bgBlur: number;
}
```

### Interactive Component & State Mapping

1. **FileUpload (`/src/components/common/FileUpload.tsx`)**:
   - Enhanced with `multiple={true}` and `onFilesSelect={(files: File[]) => void}` props to accept multiple dropped files.
   - Updated `loadDemoImage` to generate a batch of 4 distinct test images (landscape product, portrait silhouette, vector icon, geometric composition) for instant one-click testing.
2. **Batch Processing View (`/src/components/views/BatchView.tsx`)**:
   - Manages `batchQueue: BatchItem[]`, `globalConfig: BatchToolConfig`, `isProcessingAll: boolean`, and `overallProgress: number`.
   - Renders tool selector tabs, global parameters bar, batch queue grid/list, individual override drawers, and bulk export actions.
3. **ZIP Generator (`/src/utils/zipExporter.ts`)**:
   - Creates uncompressed or DEFLATE-compressed ZIP archives directly in the browser from Blobs using standard Uint8Array structure.
   - Triggers browser download for `pixelcraft-batch-[tool]-[timestamp].zip`.
4. **Tools Data & Navigation (`/src/data/toolsData.ts` & `/src/components/Header/DesktopNavigation.tsx`)**:
   - Register Batch Resizer & Batch Studio in navigation and tools directory.

---

## Plan Implementation Steps

1. **Create Client-Side ZIP Generator Utility** (`src/utils/zipExporter.ts`):
   - Browser-native binary ZIP packager constructing standard ZIP headers, local file headers, central directory records, and triggering instant Blob download.
2. **Update Multi-File Upload Component** (`src/components/common/FileUpload.tsx`):
   - Add `multiple?: boolean` and `onFilesSelect?: (files: File[]) => void`.
   - Implement multi-file drag-and-drop validation and sample batch generation.
3. **Build Batch Processing View Component** (`src/components/views/BatchView.tsx`):
   - Create responsive batch workspace UI with tool selection tabs, parameter controls, queue grid, progress bars, per-item override controls, and download actions.
4. **Integrate Batch Route & Navigation**:
   - Update `RouterContext.tsx` to include `batch: 'Batch Studio'`.
   - Update `DesktopNavigation.tsx` and `MobileNavigation.tsx` to add "Batch Studio".
   - Update `App.tsx` and `toolsData.ts` to route `/batch` and link "Bulk Resizer" to batch workspace.
5. **Validation & Verification**:
   - Run unit tests for batch file processing and ZIP generation.
   - Run `compile_applet` and `lint_applet` to verify zero build or lint errors.
   - Perform Playwright browser testing on `/batch` with sample batch images.
