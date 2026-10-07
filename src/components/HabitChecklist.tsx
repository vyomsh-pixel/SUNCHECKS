import React from 'react';
import { HabitItem } from '../types';
import { Sun, Droplet, Activity, Wind, Check } from 'lucide-react';

interface HabitChecklistProps {
  habits: HabitItem[];
  completedIds: string[];
  onToggleHabit: (id: string) => void;
}

export const HabitChecklist: React.FC<HabitChecklistProps> = ({
  habits,
  completedIds,
  onToggleHabit,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return Sun;
      case 'Droplet': return Droplet;
      case 'Activity': return Activity;
      default: return Wind;
    }
  };

  const completedCount = completedIds.length;
  const totalCount = habits.length;

  return (
    <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl p-5 border border-paper-200 dark:border-paper-darkBorder shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-sans font-semibold text-base text-slate-800 dark:text-slate-100">
            Micro Habits
          </h2>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
            Small daily acts of grounding
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300">
          {completedCount}/{totalCount} done
        </span>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => {
          const isDone = completedIds.includes(habit.id);
          const Icon = getIcon(habit.iconName);

          return (
            <button
              key={habit.id}
              type="button"
              onClick={() => onToggleHabit(habit.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                isDone
                  ? 'bg-sage-50/70 dark:bg-sage-950/30 border-sage-300 dark:border-sage-700/60'
                  : 'bg-paper-50 dark:bg-paper-dark border-transparent hover:border-paper-300 dark:hover:border-paper-darkBorder'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isDone
                      ? 'bg-sage-600 text-white'
                      : 'bg-paper-200/80 dark:bg-paper-darkBorder text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`font-sans text-sm font-medium transition-colors ${
                      isDone
                        ? 'text-slate-900 dark:text-slate-100 line-through opacity-70'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {habit.label}
                  </p>
                  <p className="font-sans text-xs text-slate-400 dark:text-slate-500">
                    {habit.hint}
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-sage-600 border-sage-600 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-paper-darkCard'
                }`}
              >
                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
