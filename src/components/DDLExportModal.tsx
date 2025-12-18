'use client';

import { useState, useEffect } from 'react';
import { DataModel, DatabaseType } from '@/types/model';
import { generateDDL, DDLOptions, DATABASE_NAMES } from '@/lib/ddlGenerator';
import {
  X,
  Copy,
  Download,
  Check,
  Database,
  Code,
  FileCode,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface DDLExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: DataModel;
}

export default function DDLExportModal({ isOpen, onClose, model }: DDLExportModalProps) {
  const [targetDb, setTargetDb] = useState<DatabaseType>(model.targetDatabase || 'postgresql');
  const [options, setOptions] = useState<DDLOptions>({
    includeDropStatements: false,
    includeComments: true,
    includeForeignKeys: true,
    includeIndexes: true,
  });
  const [ddl, setDdl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Generate DDL when options change
  useEffect(() => {
    if (isOpen && model) {
      const generatedDDL = generateDDL(model, targetDb, options);
      setDdl(generatedDDL);
    }
  }, [isOpen, model, targetDb, options]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ddl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([ddl], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.name.toLowerCase().replace(/\s+/g, '_')}_${targetDb}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-light-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
              <FileCode className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export SQL DDL</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {model.entities.length} tables, {model.relationships.length} relationships
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-light-card dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
          {/* Database selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Target:</span>
            </div>
            <div className="flex gap-1 p-1 bg-white dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
              {(Object.keys(DATABASE_NAMES) as DatabaseType[]).map((db) => (
                <button
                  key={db}
                  onClick={() => setTargetDb(db)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    targetDb === db
                      ? 'bg-accent-primary text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-light-hover dark:hover:bg-dark-hover'
                  }`}
                >
                  {DATABASE_NAMES[db]}
                </button>
              ))}
            </div>
          </div>

          {/* Options toggle */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Options
            <ChevronDown className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Options panel */}
        {showOptions && (
          <div className="px-6 py-3 bg-light-card/50 dark:bg-dark-bg/50 border-b border-light-border dark:border-dark-border">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeDropStatements}
                  onChange={(e) => setOptions({ ...options, includeDropStatements: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include DROP statements</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeComments}
                  onChange={(e) => setOptions({ ...options, includeComments: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include comments</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeForeignKeys}
                  onChange={(e) => setOptions({ ...options, includeForeignKeys: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include foreign keys</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeIndexes}
                  onChange={(e) => setOptions({ ...options, includeIndexes: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include indexes</span>
              </label>
            </div>
          </div>
        )}

        {/* Code preview */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-4">
            <pre className="min-h-full p-4 bg-gray-900 dark:bg-black rounded-xl text-sm font-mono overflow-x-auto">
              <code className="text-gray-100">
                {ddl.split('\n').map((line, index) => (
                  <div key={index} className="leading-6">
                    <span className="select-none text-gray-500 mr-4 inline-block w-8 text-right">
                      {index + 1}
                    </span>
                    <span className={
                      line.startsWith('--')
                        ? 'text-gray-500'
                        : line.includes('CREATE') || line.includes('ALTER') || line.includes('DROP')
                        ? 'text-purple-400'
                        : line.includes('PRIMARY KEY') || line.includes('FOREIGN KEY') || line.includes('REFERENCES')
                        ? 'text-amber-400'
                        : line.includes('NOT NULL') || line.includes('UNIQUE') || line.includes('DEFAULT')
                        ? 'text-emerald-400'
                        : 'text-gray-100'
                    }>
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {ddl.split('\n').length} lines
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-primary hover:bg-accent-primary-dark text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download .sql
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
