'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModel } from '@/context/ModelContext';
import { useTheme } from '@/context/ThemeContext';
import DiagramCanvas from '@/components/canvas/DiagramCanvas';
import ChatPanel from '@/components/chat/ChatPanel';
import {
  Database,
  Home,
  Download,
  Save,
  Sun,
  Moon,
  ChevronLeft,
} from 'lucide-react';

export default function WorkspacePage() {
  const router = useRouter();
  const { model, saveToLocalStorage } = useModel();
  const { theme, toggleTheme } = useTheme();

  // Redirect to home if no model
  useEffect(() => {
    if (!model) {
      // Try to load from localStorage first (happens in context)
      const timeout = setTimeout(() => {
        if (!model) {
          router.push('/');
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [model, router]);

  const handleSave = () => {
    saveToLocalStorage();
    // Show toast notification (simple alert for now)
    alert('Model saved to browser storage!');
  };

  const handleExport = () => {
    if (!model) return;

    const dataStr = JSON.stringify(model, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <Database className="w-8 h-8 text-accent-primary animate-pulse" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Loading model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg transition-colors duration-200">
      {/* Header */}
      <header className="h-14 border-b border-light-border dark:border-dark-border px-4 flex items-center justify-between bg-white dark:bg-dark-bg z-10">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Back to Home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold leading-tight text-gray-900 dark:text-white">{model.name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {model.entities.length} entities · {model.relationships.length} relationships
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors text-sm"
            title="Save to Browser"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors text-sm"
            title="Export Model"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-2" />

          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary hover:bg-accent-primary-dark text-white rounded-lg transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">New Model</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <DiagramCanvas />

        {/* Chat Panel */}
        <ChatPanel />
      </div>
    </div>
  );
}
