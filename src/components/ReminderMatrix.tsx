// ReminderMatrix: Multi-Cadence Operations Grid
// STRICT RULE: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState } from 'react';
import { ReminderItem, ReminderTheme, UiMode } from '../types';
import {
  Clock,
  Calendar,
  Shuffle,
  Mail,
  Send,
  Trash2,
  Play,
  Pause,
  Plus,
} from 'lucide-react';
import { TechBadge } from './TechBadge';

interface ReminderMatrixProps {
  reminders: ReminderItem[];
  uiMode: UiMode;
  onAddClick: () => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
  onTriggerNow: (id: string) => void;
}

const FUN_QUOTES = [
  "Did you actually write tests today or did you just pray to the prod gods?",
  "Remember: Git commit before crying.",
  "Drink water right now or turn into a dried-out neural net.",
  "That AWS certification exam won't study for itself, lock in.",
  "404: Sleep not found. Freelance deadline imminent.",
];

export function ReminderMatrix({
  reminders,
  uiMode,
  onAddClick,
  onToggleStatus,
  onDelete,
  onTriggerNow,
}: ReminderMatrixProps) {
  const [filterTheme, setFilterTheme] = useState<ReminderTheme | 'all'>('all');
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const filtered = filterTheme === 'all'
    ? reminders
    : reminders.filter((r) => r.theme === filterTheme);

  const handleInstantTrigger = async (id: string) => {
    setTriggeringId(id);
    await onTriggerNow(id);
    setTimeout(() => setTriggeringId(null), 1500);
  };

  const getThemeColor = (theme: ReminderTheme) => {
    switch (theme) {
      case 'work':
        return 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30';
      case 'cert':
        return 'border-amber-500/40 text-amber-300 bg-amber-950/30';
      case 'freelance':
        return 'border-pink-500/40 text-pink-300 bg-pink-950/30';
      case 'life':
        return 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30';
    }
  };

  const randomQuote = FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)];

  return (
    <div className="space-y-4">
      
      {/* Top Banner: Fun Mode Sarcastic Ribbon or Serious HUD Status */}
      {uiMode === 'fun' ? (
        <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/40 flex items-center justify-between gap-3 shadow-neon-pink">
          <div className="flex items-center gap-2.5">
            <TechBadge mode="fun" type="cat" size="md" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400">
                MEME_CHECKIN // NETRUNNER REALITY CHECK
              </span>
              <p className="text-xs font-mono text-pink-200 mt-0.5">
                "{randomQuote}"
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#0A0F1D]/80 border border-cyan-500/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-wider uppercase text-cyan-300 font-bold">
              OPERATIONAL MATRIX // MULTI-CADENCE AUTONOMOUS DISPATCH
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {reminders.filter((r) => r.status === 'active').length} ACTIVE DIRECTIVES
          </span>
        </div>
      )}

      {/* Control Bar: Category Filters & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md bg-[#0A0F1D]/70 p-3 rounded-xl border border-slate-800">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-[11px] font-mono">
          {(
            [
              { id: 'all', label: 'ALL DIRECTIVES' },
              { id: 'work', label: '[WORK]' },
              { id: 'cert', label: '[CERT]' },
              { id: 'freelance', label: '[FREELANCE]' },
              { id: 'life', label: '[LIFE]' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTheme(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTheme === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Reminder CTA */}
        <button
          onClick={onAddClick}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{uiMode === 'serious' ? 'NEW DIRECTIVE' : 'ADD TASK // LOCK IN'}</span>
        </button>

      </div>

      {/* Reminders Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0A0F1D]/50 border border-dashed border-slate-800">
          <TechBadge mode={uiMode} type="dog" size="lg" />
          <h3 className="mt-3 text-sm font-mono font-bold text-slate-300 uppercase">
            {uiMode === 'serious'
              ? 'NO DIRECTIVES IN ACTIVE QUEUE'
              : 'ZERO TASKS FOUND // YOU SLACKING?'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {uiMode === 'serious'
              ? 'Add an operational reminder to arm the 24/7 background scheduler.'
              : 'Add your study certs or intern tickets before your boss messages you.'}
          </p>
          <button
            onClick={onAddClick}
            className="mt-4 px-4 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold hover:bg-cyan-950/40 transition-colors"
          >
            [+ INITIALIZE FIRST DIRECTIVE]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isPaused = item.status === 'paused';
            const nextDate = new Date(item.nextTriggerAt);
            const formattedNext = isNaN(nextDate.getTime())
              ? 'Active'
              : nextDate.toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

            return (
              <div
                key={item.id}
                className={`group rounded-2xl p-4.5 backdrop-blur-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isPaused
                    ? 'bg-[#080D17]/50 border-slate-800 opacity-60'
                    : 'bg-[#0B1020]/75 border-cyan-500/30 hover:border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.08)] hover:shadow-neon-cyan'
                }`}
              >
                {/* Header: Theme & Cadence Tag */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getThemeColor(
                        item.theme
                      )}`}
                    >
                      [{item.theme.toUpperCase()}]
                    </span>

                    {/* Cadence badge */}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                      {item.cadence === 'random' ? (
                        <>
                          <Shuffle className="w-3 h-3 text-pink-400" />
                          <span className="text-pink-300">RANDOM 10A-11P</span>
                        </>
                      ) : item.cadence === 'interval' ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>EVERY {item.intervalDays}D @ {item.time}</span>
                        </>
                      ) : item.cadence === 'weekdays' ? (
                        <>
                          <Calendar className="w-3 h-3" />
                          <span>WEEKDAYS @ {item.time}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>DAILY @ {item.time}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-white tracking-wide leading-snug">
                    {item.title}
                  </h4>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer Telemetry & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate max-w-[140px]" title={item.email}>
                        {item.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-300">
                      <span className="text-slate-500">NEXT:</span>
                      <span className="text-cyan-300 font-bold">{formattedNext}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handleInstantTrigger(item.id)}
                      disabled={triggeringId === item.id}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-mono font-bold transition-all flex items-center gap-1 hover:bg-cyan-950/40"
                      title="Dispatch test email immediately to verify inbox reception"
                    >
                      <Send className="w-3 h-3" />
                      <span>{triggeringId === item.id ? 'DISPATCHED!' : 'TEST EMAIL NOW'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Pause / Resume */}
                      <button
                        onClick={() => onToggleStatus(item.id, item.status)}
                        className={`p-1.5 rounded border transition-colors ${
                          isPaused
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40'
                            : 'border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={isPaused ? 'Resume Directive' : 'Pause Directive'}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded border border-slate-800 text-slate-400 hover:text-pink-400 hover:border-pink-500/40 transition-colors"
                        title="Delete Directive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
