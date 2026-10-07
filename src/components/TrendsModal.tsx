import React from 'react';
import { getAllLogs } from '../storage';
import { TrendingUp, X, Calendar, Sparkles, Smile, Meh, Frown, Heart } from 'lucide-react';

interface TrendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

export const TrendsModal: React.FC<TrendsModalProps> = ({
  isOpen,
  onClose,
  streak,
}) => {
  if (!isOpen) return null;

  const logsMap = getAllLogs();
  const logsList = Object.values(logsMap).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalLogs = logsList.length;

  // Calculate mood distribution
  const moodCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalEnergy = 0;

  logsList.forEach((log) => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    totalEnergy += log.energy;
  });

  const avgEnergy = totalLogs > 0 ? (totalEnergy / totalLogs).toFixed(1) : '0';

  const moodMeta = [
    { level: 5, label: 'Radiant', icon: Sparkles, color: 'bg-ochre-500' },
    { level: 4, label: 'Good', icon: Heart, color: 'bg-sage-500' },
    { level: 3, label: 'Steady', icon: Smile, color: 'bg-sage-400' },
    { level: 2, label: 'Low', icon: Meh, color: 'bg-pond-500' },
    { level: 1, label: 'Rough', icon: Frown, color: 'bg-rose-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-paper-card dark:bg-paper-darkCard w-full max-w-lg rounded-3xl border border-paper-200 dark:border-paper-darkBorder shadow-xl overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-paper-200 dark:border-paper-darkBorder flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base text-slate-800 dark:text-slate-100">
                Trends & Check-in History
              </h2>
              <p className="font-sans text-xs text-slate-400">
                Personal wellness patterns over time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder text-center">
              <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Current Streak
              </span>
              <p className="text-xl font-bold font-sans text-ochre-600 dark:text-ochre-400 mt-0.5">
                {streak} <span className="text-xs font-normal">days</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder text-center">
              <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Avg Energy
              </span>
              <p className="text-xl font-bold font-sans text-sage-600 dark:text-sage-400 mt-0.5">
                {avgEnergy} <span className="text-xs font-normal">/10</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder text-center">
              <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Total Check-ins
              </span>
              <p className="text-xl font-bold font-sans text-slate-800 dark:text-slate-200 mt-0.5">
                {totalLogs}
              </p>
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="p-4 rounded-2xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder">
            <h3 className="font-sans font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Mood Breakdown
            </h3>
            <div className="space-y-2">
              {moodMeta.map((m) => {
                const count = moodCounts[m.level] || 0;
                const pct = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
                const Icon = m.icon;

                return (
                  <div key={m.level} className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center space-x-1.5 w-20 shrink-0 text-slate-600 dark:text-slate-400">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </div>
                    <div className="flex-1 h-2 bg-paper-200 dark:bg-paper-darkBorder rounded-full overflow-hidden">
                      <div
                        className={`h-full ${m.color} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-medium text-slate-500 text-[11px]">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past Log Entries */}
          <div>
            <h3 className="font-sans font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Past Reflections
            </h3>

            {logsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No past entries yet. Your reflections will appear here.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {logsList.map((log) => (
                  <div
                    key={log.date}
                    className="p-3 rounded-xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-sage-600" />
                        <span>{log.date}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-sage-100 dark:bg-sage-950/40 text-sage-700 dark:text-sage-300 text-[10px]">
                          Mood {log.mood}/5
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-pond-100 dark:bg-pond-950/40 text-pond-700 dark:text-pond-300 text-[10px]">
                          Energy {log.energy}/10
                        </span>
                      </span>
                    </div>

                    {log.intention && (
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-1 italic">
                        &ldquo;{log.intention}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
