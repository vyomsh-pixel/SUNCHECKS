import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface PromptCardProps {
  title: string;
  subtitle: string;
  placeholder: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  onChange: (val: string) => void;
  rows?: number;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  title,
  subtitle,
  placeholder,
  value,
  icon: Icon,
  onChange,
  rows = 2,
}) => {
  const [localVal, setLocalVal] = useState(value);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLocalVal(text);
    onChange(text);
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 1500);
    return () => clearTimeout(timer);
  };

  return (
    <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl p-5 border border-paper-200 dark:border-paper-darkBorder shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sage-50 dark:bg-sage-950/40 text-sage-600 dark:text-sage-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-100">
              {title}
            </h3>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="flex items-center text-xs text-sage-600 dark:text-sage-400 font-sans animate-fade-in">
            <Check className="w-3.5 h-3.5 mr-0.5" /> Saved
          </span>
        )}
      </div>

      <textarea
        rows={rows}
        value={localVal}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full mt-2 p-3 text-sm font-sans rounded-xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder focus:border-sage-500 dark:focus:border-sage-400 focus:outline-hidden focus:ring-1 focus:ring-sage-500/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-colors"
      />
    </div>
  );
};
