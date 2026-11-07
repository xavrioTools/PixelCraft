export type ToolCategory = 'convert' | 'compress' | 'resize' | 'enhance' | 'ai';

export interface ToolDefinition {
  id: string;
  name: string;
  path: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  categoryLabel: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
  supportedInputFormats: string[];
  supportedOutputFormats: string[];
  maxFileSizeBytes?: number;
  features: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface ImageFileMeta {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  type: string;
  previewUrl: string;
  processedUrl?: string;
  processedSizeBytes?: number;
}

export type ProcessingStep = {
  label: string;
  progressPercent: number;
};

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  downloadUrl?: string;
  downloadFilename?: string;
}
