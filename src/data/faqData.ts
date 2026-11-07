import { FAQItem } from '../types/tools';

export const GLOBAL_FAQS: FAQItem[] = [
  {
    id: 'free-policy',
    question: 'Is PixelCraft completely free to use?',
    answer: 'Yes, 100% free with no hidden charges, subscriptions, or credit card requirements. There are no daily conversion limits, no artificial file caps, and no watermarks added to your downloaded images.',
    category: 'General',
  },
  {
    id: 'privacy-security',
    question: 'Are my images uploaded to any remote server or stored in the cloud?',
    answer: 'No. PixelCraft is built on browser-native HTML5 Canvas, WebAssembly, and modern Web APIs. All conversion, compression, cropping, and background operations happen entirely inside your local device browser. Your photos never leave your machine.',
    category: 'Privacy',
  },
  {
    id: 'formats-supported',
    question: 'What file formats are supported?',
    answer: 'PixelCraft supports reading from JPG, PNG, WebP, AVIF, SVG, GIF, BMP, and TIFF. You can convert or compress into modern WebP, crisp PNG, standard JPG, or ultra-compressed AVIF formats with custom quality settings.',
    category: 'Technical',
  },
  {
    id: 'file-size-limits',
    question: 'What is the maximum file size limit?',
    answer: 'Because all image processing happens in your browser memory, PixelCraft easily handles individual image files up to 50MB and bulk batches up to 100MB without performance stutter.',
    category: 'Technical',
  },
  {
    id: 'registration-policy',
    question: 'Do I need an account or login to download processed images?',
    answer: 'No registration, login, or email capture is required. You can drag and drop your file, configure your settings, and instantly download the optimized result.',
    category: 'General',
  },
  {
    id: 'commercial-use',
    question: 'Can I use PixelCraft for commercial client work?',
    answer: 'Yes. You retain 100% full ownership, rights, and copyright to all images processed through PixelCraft. Feel free to use results for commercial websites, marketing materials, and client deliverables.',
    category: 'Legal',
  },
];
