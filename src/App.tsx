import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { SharedImageProvider } from './context/SharedImageContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { HomeView } from './components/views/HomeView';
import { AllToolsView } from './components/views/AllToolsView';
import { ToolDetailView } from './components/views/ToolDetailView';
import { BatchView } from './components/views/BatchView';
import { LegalView } from './components/views/LegalView';
import { AboutView } from './components/views/AboutView';
import { TOOLS_DATA } from './data/toolsData';
import { CommandPalette } from './components/common/CommandPalette';
import { MobileNavigation } from './components/Header/MobileNavigation';

function AppContent() {
  const { currentPath } = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderCurrentView = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomeView />;
    }

    // 2. All Tools directory
    if (currentPath === '/tools') {
      return <AllToolsView />;
    }

    // 3. Batch Studio Mode
    if (currentPath === '/batch' || currentPath === '/bulk-resize') {
      return <BatchView />;
    }

    // 3. Legal & Architecture Pages
    if (currentPath === '/terms') {
      return <LegalView type="terms" />;
    }
    if (currentPath === '/privacy') {
      return <LegalView type="privacy" />;
    }
    if (currentPath === '/security') {
      return <LegalView type="security" />;
    }
    if (currentPath === '/about') {
      return <AboutView />;
    }

    // 4. Specific Tool Routes (e.g. /convert, /compress, /resize, /background-remover, etc.)
    const matchedTool = TOOLS_DATA.find((t) => t.path === currentPath);
    if (matchedTool) {
      return <ToolDetailView toolId={matchedTool.id} />;
    }

    // 5. Fallback for sub-paths or not found: render AllToolsView
    return <AllToolsView />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full pb-16">
        {renderCurrentView()}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Components */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <MobileNavigation isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <SharedImageProvider>
          <AppContent />
        </SharedImageProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}

