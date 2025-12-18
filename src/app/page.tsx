'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModel } from '@/context/ModelContext';
import { EXAMPLE_PROMPTS } from '@/types/chat';
import {
  Database,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Users,
  Folder,
  Heart,
  BookOpen,
  Package,
  Loader2,
  Zap,
  MessageSquare,
  Code,
  Layers,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'shopping-cart': <ShoppingCart className="w-5 h-5" />,
  'users': <Users className="w-5 h-5" />,
  'folder': <Folder className="w-5 h-5" />,
  'heart': <Heart className="w-5 h-5" />,
  'book': <BookOpen className="w-5 h-5" />,
  'package': <Package className="w-5 h-5" />,
};

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setModel, setIsGenerating, model } = useModel();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate model');
      }

      setModel(data.model);
      router.push('/workspace');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleContinue = () => {
    router.push('/workspace');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AI Data Modeler</h1>
              <p className="text-xs text-gray-500">ERD Generator</p>
            </div>
          </div>
          {model && (
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
            >
              Continue with "{model.name}"
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Data Modeling
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Design databases with
              <span className="text-accent-primary"> natural language</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Describe your data model in plain English. Our AI generates complete
              entity-relationship diagrams with tables, columns, and relationships.
            </p>
          </div>

          {/* Prompt Input */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your database... e.g., 'Create an e-commerce database with users, products, orders, and reviews'"
                className="prompt-input h-32"
                disabled={isLoading}
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                {prompt.length} / 2000
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full py-4 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating your data model...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate ERD
                </>
              )}
            </button>
          </div>

          {/* Example Prompts */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">Or try an example:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXAMPLE_PROMPTS.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example.prompt)}
                  className="p-4 bg-dark-card border border-dark-border rounded-lg hover:border-accent-primary/50 hover:bg-dark-hover transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-accent-primary">
                      {iconMap[example.icon] || <Database className="w-5 h-5" />}
                    </div>
                    <span className="font-medium">{example.title}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{example.prompt}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-dark-border">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="font-medium">AI Generation</h3>
              <p className="text-sm text-gray-500">Natural language to ERD</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-accent-success/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent-success" />
              </div>
              <h3 className="font-medium">Chat Editing</h3>
              <p className="text-sm text-gray-500">Modify via conversation</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-accent-warning/10 flex items-center justify-center">
                <Code className="w-6 h-6 text-accent-warning" />
              </div>
              <h3 className="font-medium">DDL Export</h3>
              <p className="text-sm text-gray-500">Generate SQL scripts</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-accent-info/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-accent-info" />
              </div>
              <h3 className="font-medium">Visual Editor</h3>
              <p className="text-sm text-gray-500">Drag & drop canvas</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <p>AI Data Modeler - Powered by Llama 3.3 70B</p>
          <p>Built with Next.js & Groq</p>
        </div>
      </footer>
    </div>
  );
}
