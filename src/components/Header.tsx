import React from 'react';
import { Flame, Moon, Sun, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  streak: number;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  isDark,
  onToggleDark,
  onOpenSettings,
}) => {
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-paper-50/80 dark:bg-paper-dark/80 backdrop-blur-md border-b border-paper-200 dark:border-paper-darkBorder transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-sage-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg leading-tight tracking-tight text-sage-900 dark:text-sage-100">
              DayPulse
            </h1>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400">
              {todayStr}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Streak Badge */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-ochre-100 dark:bg-ochre-700/30 text-ochre-700 dark:text-ochre-300 border border-ochre-200 dark:border-ochre-600/30 font-sans text-xs font-semibold shadow-xs">
            <Flame className="w-3.5 h-3.5 text-ochre-600 dark:text-ochre-400 fill-ochre-500" />
            <span>{streak} day{streak === 1 ? '' : 's'}</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-paper-200/60 dark:hover:bg-paper-darkCard transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-paper-200/60 dark:hover:bg-paper-darkCard transition-colors"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
