import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { BreadcrumbItem } from '../types/tools';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  breadcrumbs: BreadcrumbItem[];
  activeRoute: string;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const routeLabels: Record<string, string> = {
  '': 'Home',
  tools: 'All Tools',
  batch: 'Batch Studio',
  'bulk-resize': 'Batch Processing',
  convert: 'Image Converter',
  compress: 'Image Compressor',
  crop: 'Image Cropper',
  resize: 'Image Resizer',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  security: 'Security Architecture',
};

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const segments = currentPath.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let acc = '';
    segments.forEach((seg, index) => {
      acc += `/${seg}`;
      const isLast = index === segments.length - 1;
      const label = routeLabels[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({
        label,
        href: isLast ? undefined : acc,
        current: isLast,
      });
    });

    return crumbs;
  }, [currentPath]);

  const activeRoute = useMemo(() => {
    const clean = currentPath.replace(/^\//, '').split('/')[0] || '';
    return clean;
  }, [currentPath]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, breadcrumbs, activeRoute }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
