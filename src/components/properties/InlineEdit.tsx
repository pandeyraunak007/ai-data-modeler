'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, Edit3 } from 'lucide-react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  className?: string;
  displayClassName?: string;
}

export function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit',
  type = 'text',
  className = '',
  displayClassName = '',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    if (tempValue !== value) {
      onSave(tempValue);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (editing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            rows={3}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-dark-bg border border-accent-primary rounded focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-dark-bg border border-accent-primary rounded focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`group flex items-center gap-1 px-2 py-1 -mx-2 rounded cursor-pointer hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${displayClassName}`}
    >
      <span className={`flex-1 ${!value ? 'text-gray-400 italic' : ''}`}>
        {value || placeholder}
      </span>
      <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

interface InlineSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => void;
  className?: string;
}

export function InlineSelect({
  value,
  options,
  onSave,
  className = '',
}: InlineSelectProps) {
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editing]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSave(e.target.value);
    setEditing(false);
  };

  const currentLabel = options.find(opt => opt.value === value)?.label || value;

  if (editing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        onBlur={() => setEditing(false)}
        className={`px-2 py-1 text-sm bg-white dark:bg-dark-bg border border-accent-primary rounded focus:outline-none focus:ring-1 focus:ring-accent-primary ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`group flex items-center gap-1 px-2 py-1 -mx-2 rounded cursor-pointer hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${className}`}
    >
      <span className="flex-1">{currentLabel}</span>
      <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

interface InlineCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function InlineCheckbox({
  label,
  checked,
  onChange,
  className = '',
}: InlineCheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer px-2 py-1 -mx-2 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
