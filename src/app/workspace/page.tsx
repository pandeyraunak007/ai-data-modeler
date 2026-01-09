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
  Upload,
  Loader2,
  Image,
  FileImage,
  Copy,
  History,
} from 'lucide-react';
import { exportAsPng, exportAsSvg, copyAsPng } from '@/lib/imageExport';
import { ChangeHistoryPanel } from '@/components/history';
import ResizablePanel from '@/components/ui/ResizablePanel';

export default function WorkspacePage() {
  const router = useRouter();
  const { model, saveToLocalStorage, setModel, viewMode, setViewMode } = useModel();
  const { theme, toggleTheme } = useTheme();
  const [showDDLModal, setShowDDLModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isImportingSql, setIsImportingSql] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sqlFileInputRef = useRef<HTMLInputElement>(null);

  // Image export handlers
  const handleExportPng = async () => {
    if (!model) return;
    setIsExportingImage(true);
    try {
      await exportAsPng(model);
    } catch (err) {
      console.error('Failed to export PNG:', err);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExportingImage(false);
      setShowExportMenu(false);
    }
  };

  const handleExportSvg = () => {
    if (!model) return;
    try {
      exportAsSvg(model);
    } catch (err) {
      console.error('Failed to export SVG:', err);
      alert('Failed to export SVG. Please try again.');
    }
    setShowExportMenu(false);
  };

  const handleCopyPng = async () => {
    if (!model) return;
    setIsExportingImage(true);
    try {
      await copyAsPng(model);
      alert('Diagram copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy PNG:', err);
      alert('Failed to copy to clipboard. Please try again.');
    } finally {
      setIsExportingImage(false);
      setShowExportMenu(false);
    }
  };

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

  const handleImportSql = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.sql')) {
      alert('Please select a .sql file');
      return;
    }

    setIsImportingSql(true);

    try {
      // Read file content
      const sqlContent = await file.text();

      // Call reverse engineer API
      const response = await fetch('/api/reverse-engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import SQL');
      }

      setModel(data.model);
    } catch (err: any) {
      alert(err.message || 'Failed to import SQL file');
    } finally {
      setIsImportingSql(false);
      // Reset input so same file can be selected again
      event.target.value = '';
    }
  };

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg" role="status" aria-label="Loading model">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <Database className="w-8 h-8 text-accent-primary animate-pulse" aria-hidden="true" />
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
            aria-label="Back to Home"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" aria-hidden="true" />
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
          <div className="flex items-center gap-1" role="group" aria-label="File operations">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="New Model"
              aria-label="Create new model"
            >
              <FilePlus className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="Open Model"
              aria-label="Open existing model"
            >
              <FolderOpen className="w-4 h-4" aria-hidden="true" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleOpenFile}
              className="hidden"
            />
            <button
              onClick={() => sqlFileInputRef.current?.click()}
              disabled={isImportingSql}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Import SQL (DDL)"
              aria-label="Import SQL DDL file"
              aria-busy={isImportingSql}
            >
              {isImportingSql ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent-primary" aria-hidden="true" />
              ) : (
                <Upload className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <input
              ref={sqlFileInputRef}
              type="file"
              accept=".sql"
              onChange={handleImportSql}
              className="hidden"
            />
            <button
              onClick={handleSave}
              className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="Save Model"
              aria-label="Save model to browser storage"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1" />

          {/* History Button */}
          <button
            onClick={() => setShowHistoryPanel(true)}
            className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            title="Change History (Ctrl+H)"
            aria-label="View change history"
          >
            <History className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
            )}
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors text-sm"
              title="Export Model"
              aria-label="Export model"
              aria-expanded={showExportMenu}
              aria-haspopup="menu"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-xl z-20 overflow-hidden" role="menu" aria-label="Export options">
                  {/* Image Export Section */}
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-dark-hover" aria-hidden="true">
                    Image
                  </div>
                  <button
                    onClick={handleExportPng}
                    disabled={isExportingImage}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
                    role="menuitem"
                    aria-label="Export as PNG image"
                  >
                    <Image className="w-4 h-4 text-green-600" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Export PNG</div>
                      <div className="text-xs text-gray-500">High-res image (2x)</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportSvg}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                    role="menuitem"
                    aria-label="Export as SVG vector image"
                  >
                    <FileImage className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Export SVG</div>
                      <div className="text-xs text-gray-500">Scalable vector</div>
                    </div>
                  </button>
                  <button
                    onClick={handleCopyPng}
                    disabled={isExportingImage}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
                    role="menuitem"
                    aria-label="Copy diagram to clipboard as PNG"
                  >
                    <Copy className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Copy to Clipboard</div>
                      <div className="text-xs text-gray-500">PNG image</div>
                    </div>
                  </button>

                  {/* Data Export Section */}
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-dark-hover border-t border-light-border dark:border-dark-border" aria-hidden="true">
                    Data
                  </div>
                  <button
                    onClick={() => {
                      handleExport();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                    role="menuitem"
                    aria-label="Export as JSON data file"
                  >
                    <Download className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Export JSON</div>
                      <div className="text-xs text-gray-500">Model data file</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowDDLModal(true);
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                    role="menuitem"
                    aria-label="Export as SQL DDL script"
                  >
                    <FileCode className="w-4 h-4 text-accent-primary" aria-hidden="true" />
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

        {/* Properties Panel - Resizable */}
        <ResizablePanel
          side="right"
          defaultWidth={320}
          minWidth={240}
          maxWidth={500}
          storageKey="ai-dm-properties-width"
          className="border-l border-light-border dark:border-dark-border"
        >
          <PropertiesPanel />
        </ResizablePanel>

        {/* Chat Panel - Resizable */}
        <ResizablePanel
          side="right"
          defaultWidth={320}
          minWidth={280}
          maxWidth={500}
          storageKey="ai-dm-chat-width"
          className="border-l border-light-border dark:border-dark-border"
        >
          <ChatPanel />
        </ResizablePanel>
      </div>

      {/* DDL Export Modal */}
      <DDLExportModal
        isOpen={showDDLModal}
        onClose={() => setShowDDLModal(false)}
        model={model}
      />

      {/* Change History Panel */}
      <ChangeHistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
      />
    </div>
  );
}
