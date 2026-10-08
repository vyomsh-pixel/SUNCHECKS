// ProfileAndBandwidthModal: Persona switcher, bandwidth calculator & API settings
// STRICT RULE: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState } from 'react';
import { CyberProfile, PersonaType } from '../types';
import { X, Activity, CheckCircle2 } from 'lucide-react';
import { TechBadge } from './TechBadge';

interface ProfileAndBandwidthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CyberProfile;
  bandwidthPercent: number;
  activeRemindersCount: number;
  onSaveProfile: (profile: CyberProfile) => void;
  onSendTestPing: (email: string) => Promise<boolean>;
}

const PERSONAS: { id: PersonaType; title: string; subtitle: string; defaultHours: number }[] = [
  {
    id: 'student_intern_freelancer',
    title: 'STUDENT + INTERN + FREELANCER (HIGH VELOCITY)',
    subtitle: 'Triple-track schedule: university classes, company sprint tickets, and client contracts.',
    defaultHours: 14,
  },
  {
    id: 'student',
    title: 'DEDICATED FULL-TIME STUDENT',
    subtitle: 'Focused on semester exams, lectures, assignments, and campus projects.',
    defaultHours: 8,
  },
  {
    id: 'intern',
    title: 'CORPORATE INTERN',
    subtitle: 'Focused on 9-to-5 deliverables, team standups, and codebase PR reviews.',
    defaultHours: 9,
  },
  {
    id: 'freelancer',
    title: 'FULL-TIME FREELANCER',
    subtitle: 'Client communications, project milestones, invoices, and asynchronous delivery.',
    defaultHours: 10,
  },
  {
    id: 'vacation_builder',
    title: 'VACATION // SELF-PACED BUILDER',
    subtitle: 'Free-form schedule for vacation hacking, open-source building, and new skills.',
    defaultHours: 6,
  },
];

export function ProfileAndBandwidthModal({
  isOpen,
  onClose,
  profile,
  bandwidthPercent,
  activeRemindersCount,
  onSaveProfile,
  onSendTestPing,
}: ProfileAndBandwidthModalProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [activeRole, setActiveRole] = useState<PersonaType>(profile.activeRole);
  const [dailyCapacityHours, setDailyCapacityHours] = useState(profile.dailyCapacityHours || 12);
  const [geminiApiKey, setGeminiApiKey] = useState(profile.geminiApiKey || '');
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      activeRole,
      dailyCapacityHours: Number(dailyCapacityHours) || 12,
      geminiApiKey: geminiApiKey.trim(),
    });
    onClose();
  };

  const handleTestPing = async () => {
    setTestEmailStatus('DISPATCHING...');
    const ok = await onSendTestPing(email);
    setTestEmailStatus(ok ? 'VERIFICATION SENT!' : 'FAILED TO DISPATCH');
    setTimeout(() => setTestEmailStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-[#0A0F1D]/95 border border-cyan-500/30 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <TechBadge mode={profile.uiMode} type="dev" size="sm" />
            <div>
              <h2 className="text-base font-bold font-mono tracking-wide text-cyan-300">
                SYSTEM OPERATOR & BANDWIDTH HUD
              </h2>
              <p className="text-xs text-slate-400">
                Customize operator profile, persona schedule rules, and 24/7 mailing target.
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

        <form onSubmit={handleSave} className="mt-5 space-y-5 text-xs font-sans">
          
          {/* 1. Life Bandwidth Gauge */}
          <div className="p-4 rounded-xl bg-[#060A14] border border-cyan-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                  LIFE BANDWIDTH CAPACITY GAUGE
                </span>
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  bandwidthPercent > 80
                    ? 'text-pink-400'
                    : bandwidthPercent > 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {bandwidthPercent}% LOADED
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  bandwidthPercent > 80
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, bandwidthPercent))}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>{activeRemindersCount} Active Directives</span>
              <span>{dailyCapacityHours}h Daily Bandwidth Ceiling</span>
            </div>
          </div>

          {/* 2. Persona Switcher */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
              SELECT OPERATING PERSONA
            </label>
            <div className="space-y-2">
              {PERSONAS.map((p) => {
                const isSelected = activeRole === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveRole(p.id);
                      setDailyCapacityHours(p.defaultHours);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-100">
                        {p.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {p.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Operator Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                OPERATOR CALLSIGN
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-[#050811] border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                DAILY CAPACITY CEILING (HOURS)
              </label>
              <input
                type="number"
                min="4"
                max="24"
                value={dailyCapacityHours}
                onChange={(e) => setDailyCapacityHours(Number(e.target.value) || 12)}
                className="w-full rounded-lg bg-[#050811] border border-slate-700 px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* 4. Destination Email for 24/7 Notifications */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-slate-400">
                24/7 NOTIFICATION DESTINATION EMAIL
              </label>
              <button
                type="button"
                onClick={handleTestPing}
                className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                {testEmailStatus || '[SEND TEST PING TO INBOX]'}
              </button>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vyom@domain.com"
              className="w-full rounded-lg bg-[#050811] border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 5. Gemini 3.8 Flash API Key */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              GEMINI API KEY (STRICT: GEMINI-3.8-FLASH)
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Loaded from .env (models/gemini-3.8-flash)"
              className="w-full rounded-lg bg-[#050811] border border-slate-700 px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Strictly routed to models/gemini-3.8-flash. Zero fallback to deprecated 2.5.
            </p>
          </div>

          {/* Save CTA */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all"
            >
              UPDATE CONFIGURATION
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
