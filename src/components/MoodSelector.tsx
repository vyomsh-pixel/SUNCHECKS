import React from 'react';
import { MoodLevel } from '../types';
import { Frown, Meh, Smile, Sparkles, Heart } from 'lucide-react';

interface MoodSelectorProps {
  currentMood: MoodLevel;
  onSelectMood: (mood: MoodLevel) => void;
}

const MOODS: {
  level: MoodLevel;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}[] = [
  {
    level: 1,
    label: 'Rough',
    sublabel: 'Heavy or tense',
    icon: Frown,
    activeBg: 'bg-rose-50 dark:bg-rose-950/40',
    activeBorder: 'border-rose-400 dark:border-rose-600',
    activeText: 'text-rose-700 dark:text-rose-300',
  },
  {
    level: 2,
    label: 'Low',
    sublabel: 'Quiet or drained',
    icon: Meh,
    activeBg: 'bg-pond-50 dark:bg-pond-950/40',
    activeBorder: 'border-pond-400 dark:border-pond-600',
    activeText: 'text-pond-700 dark:text-pond-300',
  },
  {
    level: 3,
    label: 'Steady',
    sublabel: 'Neutral & calm',
    icon: Smile,
    activeBg: 'bg-sage-100 dark:bg-sage-950/40',
    activeBorder: 'border-sage-400 dark:border-sage-600',
    activeText: 'text-sage-800 dark:text-sage-300',
  },
  {
    level: 4,
    label: 'Good',
    sublabel: 'Upbeat & clear',
    icon: Heart,
    activeBg: 'bg-sage-100 dark:bg-sage-900/50',
    activeBorder: 'border-sage-500 dark:border-sage-500',
    activeText: 'text-sage-800 dark:text-sage-200',
  },
  {
    level: 5,
    label: 'Radiant',
    sublabel: 'Grounded flow',
    icon: Sparkles,
    activeBg: 'bg-ochre-100 dark:bg-ochre-950/40',
    activeBorder: 'border-ochre-400 dark:border-ochre-500',
    activeText: 'text-ochre-800 dark:text-ochre-200',
  },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  currentMood,
  onSelectMood,
}) => {
  return (
    <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl p-5 border border-paper-200 dark:border-paper-darkBorder shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="font-sans font-semibold text-base text-slate-800 dark:text-slate-100">
            How are you feeling right now?
          </h2>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
            Acknowledge without judgment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {MOODS.map((item) => {
          const isSelected = currentMood === item.level;
          const Icon = item.icon;

          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onSelectMood(item.level)}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-150 ${
                isSelected
                  ? `${item.activeBg} ${item.activeBorder} ${item.activeText} shadow-xs scale-102 font-medium`
                  : 'bg-paper-50 dark:bg-paper-dark border-transparent text-slate-500 dark:text-slate-400 hover:border-paper-300 dark:hover:border-paper-darkBorder hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 mb-1.5 transition-transform ${
                  isSelected ? 'scale-110' : ''
                }`}
              />
              <span className="text-xs font-sans tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
