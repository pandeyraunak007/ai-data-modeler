'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useModel } from '@/context/ModelContext';
import { useTheme } from '@/context/ThemeContext';
import DiagramCanvas from '@/components/canvas/DiagramCanvas';
import PropertiesPanel from '@/components/properties/PropertiesPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import DDLExportModal from '@/components/DDLExportModal';
import {
  Database,
  Download,
  Save,
  Sun,
  Moon,
  ChevronLeft,
  FileCode,
  ChevronDown,
  FilePlus,
  FolderOpen,
} from 'lucide-react';

export default function WorkspacePage() {
  const router = useRouter();
  const { model, saveToLocalStorage, setModel, viewMode, setViewMode } = useModel();
  const { theme, toggleTheme } = useTheme();
  const [showDDLModal, setShowDDLModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedModel = JSON.parse(e.target?.result as string);
        // Validate model structure
        if (loadedModel.entities && loadedModel.relationships) {
          setModel(loadedModel);
        } else {
          alert('Invalid model file: missing entities or relationships');
        }
      } catch {
        alert('Failed to parse file. Please select a valid JSON model file.');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    event.target.value = '';
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
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
            <button
              onClick={() => setViewMode('logical')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'logical'
                  ? 'bg-accent-primary text-white'
                  : 'bg-light-card dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover'
              }`}
              title="Show logical names (business names)"
            >
              Logical
            </button>
            <button
              onClick={() => setViewMode('physical')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'physical'
                  ? 'bg-accent-primary text-white'
                  : 'bg-light-card dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover'
              }`}
              title="Show physical names (SQL table names)"
            >
              Physical
            </button>
          </div>

          <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1" />

          {/* File Operations */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="New Model"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="Open Model"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleOpenFile}
              className="hidden"
            />
            <button
              onClick={handleSave}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="Save Model"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1" />

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

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors text-sm"
              title="Export Model"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      handleExport();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Export JSON</div>
                      <div className="text-xs text-gray-500">Model data file</div>
                    </div>
                  </button>
                  <div className="border-t border-light-border dark:border-dark-border" />
                  <button
                    onClick={() => {
                      setShowDDLModal(true);
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-accent-primary" />
                    <div>
                      <div className="font-medium">Export SQL DDL</div>
                      <div className="text-xs text-gray-500">CREATE TABLE scripts</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <DiagramCanvas />

        {/* Properties Panel */}
        <PropertiesPanel />

        {/* Chat Panel */}
        <ChatPanel />
      </div>

      {/* DDL Export Modal */}
      <DDLExportModal
        isOpen={showDDLModal}
        onClose={() => setShowDDLModal(false)}
        model={model}
      />
    </div>
  );
}
