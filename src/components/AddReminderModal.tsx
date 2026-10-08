// AddReminderModal: Cyberpunk 2077 Gig Builder
// Supports: Daily, Interval (Every X days), Specific Weekdays, and Random (10 AM - 11 PM)
// STRICT: Zero yellow emojis.

import { useState } from 'react';
import { ReminderItem, ReminderCadence, ReminderTheme, UiMode } from '../types';
import { enhanceReminder } from '../gemini';
import { X, Sparkles, Send, Clock, Shuffle, Tag, Mail } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Partial<ReminderItem>) => void;
  defaultEmail: string;
  uiMode: UiMode;
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
    playCyberClick();
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAiEnhance = async () => {
    if (!title.trim()) return;
    setIsEnhancing(true);
    playCyberClick();
    try {
      const res = await enhanceReminder(title, theme, uiMode);
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
    playCyberAlert();

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
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#080910] border-2 border-[#FCEE0A] p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto cyber-cut-card">
        
        {/* Top corner hazard stripe */}
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <TechBadge mode={uiMode} type="dev" size="sm" />
            <div>
              <h2 className="text-base font-cyber font-black tracking-wider text-[#FCEE0A]">
                {uiMode === 'serious' ? 'SET NEW REMINDER & SCHEDULE' : 'NEW TASK // LOCK IN CHOOM'}
              </h2>
              <p className="text-xs font-tech text-slate-400 mt-0.5">
                {uiMode === 'serious'
                  ? 'Our 24/7 background engine will automatically dispatch an email at this time.'
                  : '24/7 background scheduler dispatches email automatically.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-[#FF003C] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-hud">
          
          {/* 1. Theme / Topic Selector */}
          <div>
            <label className="block text-xs font-cyber uppercase text-slate-400 mb-2 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#00F0FF]" />
              {uiMode === 'serious' ? 'CATEGORY DOMAIN' : 'TOPIC DOMAIN'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-cyber text-xs">
              {(
                [
                  { id: 'work', label: '[INTERN/WORK]', activeBg: 'bg-[#00F0FF] text-black font-extrabold' },
                  { id: 'cert', label: '[STUDY/CERT]', activeBg: 'bg-[#FCEE0A] text-black font-extrabold' },
                  { id: 'freelance', label: '[FREELANCE]', activeBg: 'bg-[#FF003C] text-white font-extrabold' },
                  { id: 'life', label: '[LIFE/RESET]', activeBg: 'bg-[#00FF66] text-black font-extrabold' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setTheme(t.id);
                  }}
                  className={`py-2 px-2 border transition-all cyber-cut text-center ${
                    theme === t.id
                      ? `${t.activeBg} border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]`
                      : 'border-slate-800 bg-[#0E101A] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Title + AI Enhance button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-cyber uppercase text-slate-400">
                {uiMode === 'serious' ? 'REMINDER TITLE' : 'GIG / DIRECTIVE TITLE'}
              </label>
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={!title.trim() || isEnhancing}
                className="flex items-center gap-1.5 text-xs font-cyber text-[#00F0FF] hover:text-white disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" />
                <span>{isEnhancing ? 'ENHANCING...' : 'ENHANCE VIA GEMINI 3.8 FLASH'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Complete AWS VPC peering lab & study quiz..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#05060A] border-2 border-slate-700 px-3.5 py-2.5 text-sm font-hud text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
            />
          </div>

          {/* 3. Cadence Selector */}
          <div>
            <label className="block text-xs font-cyber uppercase text-slate-400 mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#FCEE0A]" />
              {uiMode === 'serious' ? 'SCHEDULE FREQUENCY' : 'CADENCE ENGINE'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-cyber text-xs">
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setCadence('daily');
                }}
                className={`py-2 px-2 border text-center cyber-cut ${
                  cadence === 'daily'
                    ? 'bg-[#00FF66] text-black font-extrabold border-[#00FF66]'
                    : 'border-slate-800 bg-[#0E101A] text-slate-400'
                }`}
              >
                DAILY
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setCadence('interval');
                }}
                className={`py-2 px-2 border text-center cyber-cut ${
                  cadence === 'interval'
                    ? 'bg-[#FCEE0A] text-black font-extrabold border-[#FCEE0A]'
                    : 'border-slate-800 bg-[#0E101A] text-slate-400'
                }`}
              >
                EVERY X DAYS
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setCadence('weekdays');
                }}
                className={`py-2 px-2 border text-center cyber-cut ${
                  cadence === 'weekdays'
                    ? 'bg-[#00F0FF] text-black font-extrabold border-[#00F0FF]'
                    : 'border-slate-800 bg-[#0E101A] text-slate-400'
                }`}
              >
                WEEKDAYS
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setCadence('random');
                }}
                className={`py-2 px-2 border text-center cyber-cut ${
                  cadence === 'random'
                    ? 'bg-[#FF003C] text-white font-extrabold border-[#FF003C] shadow-[0_0_12px_rgba(255,0,60,0.6)]'
                    : 'border-slate-800 bg-[#0E101A] text-slate-400'
                }`}
              >
                RANDOM (10A-11P)
              </button>
            </div>
          </div>

          {/* Cadence Specific Inputs */}
          {cadence !== 'random' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#05060A] border-2 border-slate-800 cyber-cut">
              <div>
                <label className="block text-xs font-tech text-slate-400 mb-1">
                  EXECUTION TIME (24H)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#0E101A] border border-slate-700 px-3 py-1.5 text-sm font-tech text-[#FCEE0A] focus:outline-none focus:border-[#FCEE0A] cyber-cut"
                />
              </div>

              {cadence === 'interval' && (
                <div>
                  <label className="block text-xs font-tech text-slate-400 mb-1">
                    INTERVAL (DAYS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-[#0E101A] border border-slate-700 px-3 py-1.5 text-sm font-tech text-[#FCEE0A] focus:outline-none focus:border-[#FCEE0A] cyber-cut"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-[#1F0712] border-2 border-[#FF003C]/70 cyber-cut flex items-start gap-3">
              <Shuffle className="w-5 h-5 text-[#FF003C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-cyber font-black text-[#FF003C]">
                  AUTONOMOUS RANDOM DISPATCH (10:00 AM – 11:00 PM)
                </p>
                <p className="text-xs font-tech text-slate-300 leading-relaxed mt-0.5">
                  The 24/7 daemon calculates a surprising random minute every day between 10 AM and 11 PM to ping your inbox.
                </p>
              </div>
            </div>
          )}

          {/* Weekday Selection Pills */}
          {cadence === 'weekdays' && (
            <div>
              <label className="block text-xs font-cyber text-slate-400 mb-2">
                ACTIVE WEEKDAYS
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((w) => {
                  const active = selectedWeekdays.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleToggleWeekday(w.id)}
                      className={`px-3.5 py-1.5 text-xs font-cyber transition-all cyber-cut ${
                        active
                          ? 'bg-[#00F0FF] text-black font-extrabold shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                          : 'bg-[#121422] text-slate-400 border border-slate-800'
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
            <label className="block text-xs font-cyber uppercase text-slate-400 mb-1.5">
              ACTIONABLE DETAILS / DIRECTIVE STEPS
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Focus on subnets, transit gateways, and run the 15-minute mock test..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#05060A] border-2 border-slate-700 px-3.5 py-2 text-xs font-hud text-slate-200 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
            />
          </div>

          {/* Auto-Email Configuration */}
          <div className="p-3.5 bg-[#05060A] border-2 border-slate-800 cyber-cut space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FCEE0A]" />
                <span className="text-xs font-cyber font-bold text-slate-200">
                  AUTO-EMAIL DISPATCH (24/7)
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoEmail}
                onChange={(e) => setAutoEmail(e.target.checked)}
                className="w-4 h-4 accent-[#FCEE0A] cursor-pointer"
              />
            </div>
            {autoEmail && (
              <div>
                <label className="block text-[11px] font-tech text-slate-400 mb-1">
                  DESTINATION INBOX
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajkesir74@gmail.com"
                  className="w-full bg-[#0E101A] border border-slate-700 px-3 py-1.5 text-xs font-tech text-slate-200 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-800">
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-cyber text-slate-400 hover:text-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 cyber-btn-yellow text-xs font-black flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>COMMIT DIRECTIVE</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
