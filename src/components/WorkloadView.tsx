// WorkloadView: In-Place Operator Identity, Persona Switcher & Life Bandwidth Tracker
// STRICT: Zero yellow emojis. Clean Lucide vector icons and monospace text badges.
// PRIVACY-FIRST: Gemini API key removed from UI (handled securely on serverless backend).
// Operator Name & Email are shielded with an instant privacy toggle.

import { useState } from 'react';
import { CyberProfile, PersonaType, UiMode } from '../types';
import { User, CheckCircle2, Shield, Eye, EyeOff, Sparkles } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberAlert } from '../cyberAudio';

interface WorkloadViewProps {
  profile: CyberProfile;
  bandwidthPercent: number;
  activeRemindersCount: number;
  uiMode: UiMode;
  onSaveProfile: (profile: CyberProfile) => Promise<void>;
  onSendTestPing?: (email: string) => Promise<boolean>;
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

export function WorkloadView({
  profile,
  bandwidthPercent,
  activeRemindersCount,
  uiMode,
  onSaveProfile,
}: WorkloadViewProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [activeRole, setActiveRole] = useState<PersonaType>(profile.activeRole);
  const [dailyCapacityHours, setDailyCapacityHours] = useState(profile.dailyCapacityHours || 14);
  const [shieldActive, setShieldActive] = useState(true);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSelectPersona = (p: typeof PERSONAS[0]) => {
    playCyberClick();
    setActiveRole(p.id);
    setDailyCapacityHours(p.defaultHours);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberAlert();
    await onSaveProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      activeRole,
      dailyCapacityHours: Number(dailyCapacityHours) || 14,
    });
    setSavedStatus('PROFILE & CAPACITY SAVED!');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Life Bandwidth Consumption Meter */}
      <div className="cyber-redone-container p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <TechBadge mode={uiMode} type="dev" size="lg" />
            <div>
              <h2 className="font-cyber text-lg font-black tracking-wider text-[#FCEE0A]">
                {uiMode === 'serious' ? 'OPERATOR WORKLOAD & LIFE BANDWIDTH' : 'BURNOUT & CAPACITY METER'}
              </h2>
              <p className="text-xs font-tech text-slate-300">
                Active schedule load calculated against your {dailyCapacityHours}h daily bandwidth ceiling.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-cyber text-slate-400 block uppercase">CURRENT UTILIZATION</span>
            <span className="font-cyber text-2xl font-black text-[#FCEE0A]">{bandwidthPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-[#05060A]/90 border-2 border-[#00F0FF]/50 cyber-cut space-y-3">
          <div className="w-full h-3.5 bg-[#0D0F18] border border-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                bandwidthPercent > 80
                  ? 'bg-gradient-to-r from-[#FCEE0A] to-[#FF003C]'
                  : 'bg-gradient-to-r from-[#00F0FF] to-[#00FF66]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, bandwidthPercent))}%` }}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-tech text-slate-400">
            <span>
              {activeRemindersCount} active schedules armed &bull; {profile.certTargets.length} certification targets tracked
            </span>
            <span className={bandwidthPercent > 80 ? 'text-[#FF003C] font-bold' : 'text-[#00FF66]'}>
              {bandwidthPercent > 80
                ? 'High cognitive velocity: ensure adequate recovery intervals.'
                : 'Balanced load: cognitive headroom available for study modules.'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Persona Switcher */}
      <div className="cyber-redone-container p-6 relative">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="font-cyber text-sm font-black tracking-wider uppercase text-white">
              SELECT OPERATOR SCHEDULE PROFILE
            </h3>
          </div>
          <span className="text-xs font-tech text-slate-400">ADAPTIVE CAPACITY MODES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 font-hud">
          {PERSONAS.map((p) => {
            const isSelected = activeRole === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPersona(p)}
                className={`p-4 cursor-pointer transition-all border cyber-cut flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#060810]/80 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-cyber text-xs font-bold text-white">{p.title}</span>
                    <span className="font-tech text-xs text-[#FCEE0A] font-bold">{p.defaultHours}h/day</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-tech">{p.subtitle}</p>
                </div>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#1CED82] font-tech font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE OPERATOR PERSONA</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. In-Place Identity, Capacity & Privacy Shield Config */}
      <div className="cyber-redone-container p-6 relative">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FCEE0A]" />
            <h3 className="font-cyber text-sm font-black tracking-wider uppercase text-white">
              OPERATOR IDENTITY & PRIVACY SHIELD
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              setShieldActive(!shieldActive);
            }}
            className="px-2.5 py-1 bg-[#05060A] border border-slate-700 hover:border-[#00F0FF] text-xs font-tech text-slate-300 flex items-center gap-1.5 cyber-cut"
          >
            {shieldActive ? <EyeOff className="w-3.5 h-3.5 text-[#FCEE0A]" /> : <Eye className="w-3.5 h-3.5 text-[#00FF66]" />}
            <span>{shieldActive ? 'SHIELDED (CLICK TO REVEAL)' : 'VISIBLE (CLICK TO SHIELD)'}</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-hud">
            <div>
              <label className="block text-xs font-cyber text-slate-300 mb-1">OPERATOR NAME</label>
              <input
                type={shieldActive ? 'password' : 'text'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Operator name..."
                className="w-full bg-[#05060A] border border-slate-700 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs font-cyber text-slate-300 mb-1">PRIMARY EMAIL DESTINATION</label>
              <input
                type={shieldActive ? 'password' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="destination@domain.com"
                className="w-full bg-[#05060A] border border-slate-700 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#FCEE0A] cyber-cut tracking-wider"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-cyber text-slate-300 mb-1">
              <span>DAILY CAPACITY CEILING: {dailyCapacityHours} HOURS</span>
              <span className="font-tech text-[#00F0FF]">{dailyCapacityHours}h per 24h cycle</span>
            </div>
            <input
              type="range"
              min="4"
              max="18"
              step="1"
              value={dailyCapacityHours}
              onChange={(e) => setDailyCapacityHours(Number(e.target.value))}
              className="w-full accent-[#FCEE0A] cursor-pointer"
            />
          </div>

          {/* Secure Backend AI Engine Status (Zero client-side key exposure) */}
          <div className="p-3 bg-[#060812] border border-[#00F0FF]/40 cyber-cut flex items-center justify-between gap-3 text-xs font-tech">
            <div className="flex items-center gap-2 text-[#00F0FF]">
              <Sparkles className="w-4 h-4 text-[#00F0FF]" />
              <span className="font-bold">AI ENGINE // GEMINI 3.8 FLASH</span>
            </div>
            <span className="text-[10px] text-[#00FF66] bg-[#00FF66]/15 border border-[#00FF66]/40 px-2 py-0.5 cyber-cut font-bold">
              SECURED SERVER-SIDE // ZERO BROWSER KEY EXPOSURE
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 cyber-btn-yellow text-xs font-black"
            >
              [SAVE CONFIGURATION]
            </button>
            {savedStatus && (
              <span className="font-tech text-xs text-[#00FF66] font-bold">{savedStatus}</span>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}
