import React, { createContext, useContext, useState } from 'react';

export interface SharedImageData {
  file: File;
  url: string;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  format: string;
  aspectRatio: string;
}

interface SharedImageContextType {
  sharedImage: SharedImageData | null;
  setSharedImage: (img: SharedImageData | null) => void;
  clearSharedImage: () => void;
}

const SharedImageContext = createContext<SharedImageContextType | undefined>(undefined);

export function SharedImageProvider({ children }: { children: React.ReactNode }) {
  const [sharedImage, setSharedImage] = useState<SharedImageData | null>(null);

  const clearSharedImage = () => {
    setSharedImage(null);
  };

  return (
    <SharedImageContext.Provider value={{ sharedImage, setSharedImage, clearSharedImage }}>
      {children}
    </SharedImageContext.Provider>
  );
}

export function useSharedImage() {
  const context = useContext(SharedImageContext);
  if (!context) {
    throw new Error('useSharedImage must be used within a SharedImageProvider');
  }
  return context;
}
