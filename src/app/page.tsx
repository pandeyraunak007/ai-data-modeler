'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModel } from '@/context/ModelContext';
import { useTheme } from '@/context/ThemeContext';
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
  Sun,
  Moon,
  Github,
  Play,
  Check,
  ChevronRight,
  Table,
  GitBranch,
  Download,
  Share2,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'shopping-cart': <ShoppingCart className="w-5 h-5" />,
  'users': <Users className="w-5 h-5" />,
  'folder': <Folder className="w-5 h-5" />,
  'heart': <Heart className="w-5 h-5" />,
  'book': <BookOpen className="w-5 h-5" />,
  'package': <Package className="w-5 h-5" />,
};

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Describe your database in plain English. Our AI understands context and generates complete ERDs.',
    color: 'text-accent-primary',
    bgColor: 'bg-accent-primary/10',
  },
  {
    icon: MessageSquare,
    title: 'Chat-Based Editing',
    description: 'Refine your model through conversation. Add tables, modify columns, create relationships naturally.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Layers,
    title: 'Interactive Canvas',
    description: 'Drag, zoom, and pan your diagrams. Professional Crow\'s foot notation with smart auto-layout.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Download,
    title: 'Export & Share',
    description: 'Download your models as JSON. Share with your team or import into other tools.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

const stats = [
  { label: 'Response Time', value: '< 2s' },
  { label: 'AI Model', value: 'Llama 3.3 70B' },
  { label: 'Cost', value: 'Free' },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setModel, setIsGenerating, model } = useModel();
  const { theme, toggleTheme } = useTheme();

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg transition-colors duration-200">
      {/* Gradient Background */}
      <div className="fixed inset-0 hero-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-hero-pattern pointer-events-none opacity-50 dark:opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-light-border dark:border-dark-border bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center shadow-lg shadow-accent-primary/25">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">AI Data Modeler</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">ERD Generator</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {/* GitHub */}
              <a
                href="https://github.com/pandeyraunak007/ai-data-modeler"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>

              {/* Continue button */}
              {model && (
                <button
                  onClick={() => router.push('/workspace')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-primary-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-primary/25"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 dark:bg-accent-primary/20 border border-accent-primary/20 text-accent-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Powered by Llama 3.3 70B
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Design databases with{' '}
              <span className="gradient-text">natural language</span>
            </h2>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Describe your data model in plain English. Our AI generates complete
              entity-relationship diagrams with tables, columns, and relationships.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="space-y-4 animate-slide-up">
            {/* Textarea */}
            <div className="relative">
              <div className="animated-border p-[2px] rounded-2xl">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your database... e.g., 'Create an e-commerce database with users, products, orders, and reviews'"
                  className="w-full h-36 bg-white dark:bg-dark-bg rounded-2xl p-5 text-lg resize-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <span className="text-sm text-gray-400">{prompt.length} / 2000</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-dark-card rounded border border-gray-200 dark:border-dark-border">
                  <span className="text-base">⌘</span> Enter
                </kbd>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs">!</span>
                </div>
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full py-4 bg-gradient-to-r from-accent-primary to-purple-600 hover:from-accent-primary-dark hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent-primary/25 hover:shadow-2xl hover:shadow-accent-primary/30 disabled:shadow-none"
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
        </section>

        {/* Example Prompts */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Or try one of these examples</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example.prompt)}
                className="group p-5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/5 transition-all text-left hover-lift"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-white transition-colors">
                    {iconMap[example.icon] || <Database className="w-5 h-5" />}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{example.title}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {example.prompt}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-light-border dark:border-dark-border bg-light-card/50 dark:bg-dark-card/30">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Everything you need for data modeling
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                From natural language to production-ready database schemas in seconds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="feature-card hover-lift">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How it works
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Three simple steps to create your database schema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Describe',
                description: 'Write what you need in plain English. Be as detailed or brief as you like.',
                icon: MessageSquare,
              },
              {
                step: '2',
                title: 'Generate',
                description: 'Our AI creates a complete ERD with entities, attributes, and relationships.',
                icon: Sparkles,
              },
              {
                step: '3',
                title: 'Refine',
                description: 'Use the chat to make changes. Add tables, modify columns, adjust relationships.',
                icon: GitBranch,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-accent-primary/25">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-accent-primary text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ChevronRight className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-primary to-purple-600 p-8 md:p-12 text-center text-white">
            <div className="absolute inset-0 bg-hero-pattern opacity-10" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to design your database?
              </h3>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Start with a description and let AI do the heavy lifting. No sign-up required.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
              >
                <Play className="w-5 h-5" />
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                AI Data Modeler - Powered by Groq & Llama 3.3 70B
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/pandeyraunak007/ai-data-modeler"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/pandeyraunak007/ai-data-modeler/blob/master/Guide.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent-primary transition-colors"
              >
                Documentation
              </a>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                Built with Next.js
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
