// AddReminderModal: Sleek glassmorphic reminder builder
// Supports: Daily, Interval (Every X days), Specific Weekdays, and Random (10 AM - 11 PM)
// STRICT: Zero yellow emojis.

import { useState } from 'react';
import { ReminderItem, ReminderCadence, ReminderTheme, UiMode } from '../types';
import { enhanceReminder } from '../gemini';
import { X, Sparkles, Send, Clock, Shuffle, Tag, Mail } from 'lucide-react';
import { TechBadge } from './TechBadge';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Partial<ReminderItem>) => void;
  defaultEmail: string;
  uiMode: UiMode;
  apiKey?: string;
}

const WEEKDAYS = [
  { id: 'mon', label: 'MON' },
  { id: 'tue', label: 'TUE' },
  { id: 'wed', label: 'WED' },
  { id: 'thu', label: 'THU' },
  { id: 'fri', label: 'FRI' },
  { id: 'sat', label: 'SAT' },
  { id: 'sun', label: 'SUN' },
];

export function AddReminderModal({
  isOpen,
  onClose,
  onSave,
  defaultEmail,
  uiMode,
  apiKey,
}: AddReminderModalProps) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<ReminderTheme>('work');
  const [description, setDescription] = useState('');
  const [cadence, setCadence] = useState<ReminderCadence>('daily');
  const [time, setTime] = useState('10:00');
  const [intervalDays, setIntervalDays] = useState(2);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(['mon', 'wed', 'fri']);
  const [email, setEmail] = useState(defaultEmail);
  const [autoEmail, setAutoEmail] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);

  if (!isOpen) return null;

  const handleToggleWeekday = (day: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAiEnhance = async () => {
    if (!title.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await enhanceReminder(title, theme, uiMode, apiKey);
      setDescription(
        `${res.formattedSummary}\n\nKey Steps:\n${res.actionableSteps.map((s) => `• ${s}`).join('\n')}`
      );
    } catch (err: unknown) {
      console.warn('AI enhancement fallback:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      theme,
      description: description.trim(),
      cadence,
      time,
      intervalDays: Number(intervalDays) || 1,
      weekdays: selectedWeekdays,
      email: email.trim() || defaultEmail,
      autoEmail,
      status: 'active',
    });

    onClose();
    // Reset form
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-[#0A0F1D]/90 border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/60 text-slate-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TechBadge mode={uiMode} type="dev" size="sm" />
            <div>
              <h2 className="text-base font-bold font-mono tracking-wide text-cyan-300">
                {uiMode === 'serious' ? 'CONFIGURE OPERATIONAL REMINDER' : 'NEW TASK // LOCK IN'}
              </h2>
              <p className="text-xs text-slate-400">
                24/7 background scheduler will dispatch automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-sans">
          
          {/* 1. Theme / Topic Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              TOPIC DOMAIN
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              {(
                [
                  { id: 'work', label: '[INTERN / WORK]', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40' },
                  { id: 'cert', label: '[STUDY / CERT]', color: 'border-amber-500/40 text-amber-300 bg-amber-950/40' },
                  { id: 'freelance', label: '[FREELANCE]', color: 'border-pink-500/40 text-pink-300 bg-pink-950/40' },
                  { id: 'life', label: '[LIFE / HABIT]', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    theme === t.id
                      ? `${t.color} font-bold ring-1 ring-cyan-400/50`
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Title + AI Enhance button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase text-slate-400">
                DIRECTIVE / TASK TITLE
              </label>
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={!title.trim() || isEnhancing}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 disabled:opacity-40 transition-opacity"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>{isEnhancing ? 'ENHANCING...' : 'ENHANCE VIA GEMINI 3.8 FLASH'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Complete AWS VPC peering lab & study quiz..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-[#050811] border border-slate-700/80 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* 3. Cadence Selector (Multi-cadence engine) */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              CADENCE ENGINE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setCadence('daily')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  cadence === 'daily'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400'
                }`}
              >
                DAILY
              </button>
              <button
                type="button"
                onClick={() => setCadence('interval')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  cadence === 'interval'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400'
                }`}
              >
                EVERY X DAYS
              </button>
              <button
                type="button"
                onClick={() => setCadence('weekdays')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  cadence === 'weekdays'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400'
                }`}
              >
                WEEKDAYS
              </button>
              <button
                type="button"
                onClick={() => setCadence('random')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  cadence === 'random'
                    ? 'border-pink-500 bg-pink-950/60 text-pink-300 font-bold shadow-neon-pink'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400'
                }`}
              >
                RANDOM (10A-11P)
              </button>
            </div>
          </div>

          {/* Cadence Specific Inputs */}
          {cadence !== 'random' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#060A14] border border-slate-800">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  EXECUTION TIME (24H)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded bg-[#0A0F1D] border border-slate-700 px-2 py-1.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {cadence === 'interval' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    INTERVAL (DAYS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full rounded bg-[#0A0F1D] border border-slate-700 px-2 py-1.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-pink-950/20 border border-pink-500/30 flex items-start gap-2.5">
              <Shuffle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-mono font-bold text-pink-300">
                  AUTONOMOUS RANDOM DISPATCH (10:00 AM – 11:00 PM)
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  The 24/7 backend calculates a surprising random timestamp every day between 10 AM and 11 PM to ping your inbox.
                </p>
              </div>
            </div>
          )}

          {/* Weekday Selection Pills if cadence is weekdays */}
          {cadence === 'weekdays' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                SELECT ACTIVE WEEKDAYS
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((w) => {
                  const active = selectedWeekdays.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleToggleWeekday(w.id)}
                      className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                        active
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description / Action steps */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              ACTIONABLE DETAILS / TARGET NOTES
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Focus on subnets, transit gateways, and run the 15-minute mock test..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-[#050811] border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Auto-Email Configuration */}
          <div className="p-3 rounded-xl bg-[#060A14] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  AUTO-EMAIL DISPATCH (24/7)
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoEmail}
                onChange={(e) => setAutoEmail(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
            {autoEmail && (
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">
                  DESTINATION INBOX
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full rounded bg-[#0A0F1D] border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>COMMIT DIRECTIVE</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
