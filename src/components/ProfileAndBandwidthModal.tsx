// ProfileAndBandwidthModal: Cyberpunk Operator & Bandwidth HUD
// STRICT: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState } from 'react';
import { CyberProfile, PersonaType } from '../types';
import { X, Activity, CheckCircle2 } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

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
  const [dailyCapacityHours, setDailyCapacityHours] = useState(profile.dailyCapacityHours || 14);
  const [geminiApiKey, setGeminiApiKey] = useState(profile.geminiApiKey || '');
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberAlert();
    onSaveProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      activeRole,
      dailyCapacityHours: Number(dailyCapacityHours) || 14,
      geminiApiKey: geminiApiKey.trim(),
    });
    onClose();
  };

  const handleTestPing = async () => {
    playCyberClick();
    setTestEmailStatus('DISPATCHING...');
    const ok = await onSendTestPing(email);
    setTestEmailStatus(ok ? 'VERIFICATION SENT!' : 'FAILED TO DISPATCH');
    setTimeout(() => setTestEmailStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#080910] border-2 border-[#FCEE0A] p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto cyber-cut-card relative">
        
        {/* Top corner hazard stripe */}
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <TechBadge mode={profile.uiMode} type="dev" size="sm" />
            <div>
              <h2 className="text-base font-cyber font-black tracking-wider text-[#FCEE0A]">
                SYSTEM OPERATOR &amp; BANDWIDTH HUD
              </h2>
              <p className="text-xs font-tech text-slate-400 mt-0.5">
                Customize operator profile, persona schedule rules, and 24/7 mailing target.
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

        <form onSubmit={handleSave} className="mt-5 space-y-5 font-hud">
          
          {/* 1. Life Bandwidth Capacity Gauge */}
          <div className="p-4 bg-[#05060A] border-2 border-[#00F0FF]/60 cyber-cut space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00F0FF]" />
                <span className="font-cyber text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
                  LIFE BANDWIDTH CAPACITY GAUGE
                </span>
              </div>
              <span
                className={`font-cyber text-xs font-black ${
                  bandwidthPercent > 80
                    ? 'text-[#FF003C]'
                    : bandwidthPercent > 50
                    ? 'text-[#FCEE0A]'
                    : 'text-[#00FF66]'
                }`}
              >
                {bandwidthPercent}% LOADED
              </span>
            </div>

            {/* Progress Bar with neon glow */}
            <div className="w-full h-3 bg-[#0D0F18] overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  bandwidthPercent > 80
                    ? 'bg-gradient-to-r from-[#FCEE0A] to-[#FF003C]'
                    : 'bg-gradient-to-r from-[#00F0FF] to-[#00FF66]'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, bandwidthPercent))}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-tech text-slate-400 pt-1">
              <span>{activeRemindersCount} Active Directives</span>
              <span>{dailyCapacityHours}h Daily Bandwidth Ceiling</span>
            </div>
          </div>

          {/* 2. Persona Switcher */}
          <div>
            <label className="block text-xs font-cyber uppercase text-slate-400 mb-2">
              SELECT OPERATING PERSONA
            </label>
            <div className="space-y-2">
              {PERSONAS.map((p) => {
                const isSelected = activeRole === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      playCyberClick();
                      setActiveRole(p.id);
                      setDailyCapacityHours(p.defaultHours);
                    }}
                    className={`p-3.5 border-2 cursor-pointer transition-all cyber-cut ${
                      isSelected
                        ? 'border-[#FCEE0A] bg-[#141609] shadow-[0_0_15px_rgba(252,238,10,0.3)]'
                        : 'border-slate-800 bg-[#0A0C14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-cyber text-xs font-bold text-white">
                        {p.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#FCEE0A]" />
                      )}
                    </div>
                    <p className="text-xs font-tech text-slate-400 mt-1 leading-relaxed">
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
              <label className="block text-xs font-cyber text-slate-400 mb-1">
                OPERATOR CALLSIGN
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#05060A] border-2 border-slate-700 px-3.5 py-2 text-xs font-hud text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
              />
            </div>

            <div>
              <label className="block text-xs font-cyber text-slate-400 mb-1">
                DAILY CAPACITY CEILING (HOURS)
              </label>
              <input
                type="number"
                min="4"
                max="24"
                value={dailyCapacityHours}
                onChange={(e) => setDailyCapacityHours(Number(e.target.value) || 14)}
                className="w-full bg-[#05060A] border-2 border-slate-700 px-3.5 py-2 text-xs font-tech text-[#FCEE0A] focus:outline-none focus:border-[#FCEE0A] cyber-cut"
              />
            </div>
          </div>

          {/* 4. Destination Email for 24/7 Notifications */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-cyber text-slate-400">
                24/7 NOTIFICATION DESTINATION EMAIL
              </label>
              <button
                type="button"
                onClick={handleTestPing}
                className="text-xs font-cyber text-[#00F0FF] hover:text-white"
              >
                {testEmailStatus || '[SEND TEST PING TO INBOX]'}
              </button>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rajkesir74@gmail.com"
              className="w-full bg-[#05060A] border-2 border-slate-700 px-3.5 py-2 text-xs font-tech text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
            />
          </div>

          {/* 5. Gemini 3.8 Flash API Key */}
          <div>
            <label className="block text-xs font-cyber text-slate-400 mb-1">
              GEMINI API KEY (STRICT: GEMINI-3.8-FLASH)
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Loaded from .env (models/gemini-3.8-flash)"
              className="w-full bg-[#05060A] border-2 border-slate-700 px-3.5 py-2 text-xs font-tech text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut"
            />
            <p className="text-[11px] text-slate-500 font-tech mt-1">
              Strictly routed to models/gemini-3.8-flash. Zero fallback to deprecated 2.5.
            </p>
          </div>

          {/* Save CTA */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-800">
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
              className="px-6 py-2.5 cyber-btn-yellow text-xs font-black shadow-[0_0_15px_rgba(252,238,10,0.5)]"
            >
              UPDATE CONFIGURATION
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
