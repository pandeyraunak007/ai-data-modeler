'use client';

import React from 'react';
import { DEFAULT_SUGGESTIONS, Suggestion } from '@/types/chat';
import { Clock, Zap, Layers, Code, Sparkles } from 'lucide-react';

interface SuggestionChipsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-3 h-3" />,
  zap: <Zap className="w-3 h-3" />,
  layers: <Layers className="w-3 h-3" />,
  code: <Code className="w-3 h-3" />,
};

export default function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DEFAULT_SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.prompt)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-card border border-dark-border rounded-full text-xs hover:bg-dark-hover hover:border-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-accent-primary">
            {iconMap[suggestion.icon || 'sparkles'] || <Sparkles className="w-3 h-3" />}
          </span>
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
