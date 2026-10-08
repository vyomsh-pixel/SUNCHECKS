// ReminderMatrix: Cyberpunk 2077 Comms Terminal & Gangs Dossier Matrix
// Direct inspirations:
// 1. cyberpunkredone.webflow.io: Terminal split-view with From/To readouts, messages, and typing cursor.
// 2. cyberpunk2077-gangs.webflow.io: Horizontal scrolling visual dossiers with neon accents and duotone depth.
// 3. video-bg-button.webflow.io: Dynamic looping video/canvas buttons for instant action dispatch.
// STRICT: No yellow emojis. Clean Lucide vector icons and monospace text badges.

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
  Terminal,
  Grid,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { TechBadge } from './TechBadge';
import { CyberVideoBtn } from './CyberVideoBtn';
import { playCyberClick, playCyberAlert, playCyberGlitch } from '../cyberAudio';

interface ReminderMatrixProps {
  reminders: ReminderItem[];
  uiMode: UiMode;
  onAddClick: () => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
  onTriggerNow: (id: string) => void;
}

type MatrixViewMode = 'terminal' | 'dossier' | 'grid';

export function ReminderMatrix({
  reminders,
  uiMode,
  onAddClick,
  onToggleStatus,
  onDelete,
  onTriggerNow,
}: ReminderMatrixProps) {
  const [viewMode, setViewMode] = useState<MatrixViewMode>('terminal');
  const [filterTheme, setFilterTheme] = useState<ReminderTheme | 'all'>('all');
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const filtered = filterTheme === 'all'
    ? reminders
    : reminders.filter((r) => r.theme === filterTheme);

  // Default active selection for Terminal View
  const activeReminder = filtered.find((r) => r.id === selectedReminderId) || filtered[0] || null;

  const handleInstantTrigger = async (id: string) => {
    playCyberAlert();
    setTriggeringId(id);
    await onTriggerNow(id);
    setTimeout(() => setTriggeringId(null), 1800);
  };

  const handleFilterClick = (theme: ReminderTheme | 'all') => {
    playCyberClick();
    setFilterTheme(theme);
  };

  const handleViewModeChange = (mode: MatrixViewMode) => {
    playCyberClick();
    setViewMode(mode);
  };

  const getThemeMeta = (theme: ReminderTheme) => {
    switch (theme) {
      case 'work':
        return {
          border: 'border-l-4 border-l-[#00F0FF] border-slate-800',
          badge: 'bg-[#00F0FF] text-black font-extrabold',
          accent: '#00F0FF',
          sender: 'CORPO WORK DESK // ARASAKA INBOX',
          district: 'WATSON INDUSTRIAL // CORPO PLAZA',
          label: 'GIG // INTERN_OPS',
        };
      case 'cert':
        return {
          border: 'border-l-4 border-l-[#FCEE0A] border-slate-800',
          badge: 'bg-[#FCEE0A] text-black font-extrabold',
          accent: '#FCEE0A',
          sender: 'NETRUNNER SHARD ACADEMY',
          district: 'CITY CENTER // ARASAKA SHARD VAULT',
          label: 'CONTRACT // CLOUD_CERT',
        };
      case 'freelance':
        return {
          border: 'border-l-4 border-l-[#FF003C] border-slate-800',
          badge: 'bg-[#FF003C] text-white font-extrabold',
          accent: '#FF003C',
          sender: 'FIXER UNDERGROUND // BOUNTY DISPATCH',
          district: 'HEYWOOD // THE GLEN BOUNTY DESK',
          label: 'SIDE_GIG // FREELANCE',
        };
      case 'life':
        return {
          border: 'border-l-4 border-l-[#00FF66] border-slate-800',
          badge: 'bg-[#00FF66] text-black font-extrabold',
          accent: '#00FF66',
          sender: 'BIOMONITOR // NEURAL_HEALTH_SYNC',
          district: 'PACIFICA // SANTO DOMINGO BUFFER',
          label: 'RESET // NEURAL_MAINTENANCE',
        };
    }
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Header Toolbar with View Mode Switchers & Filter Skew Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D0F18]/95 p-3.5 border-t-2 border-[#FCEE0A] cyber-cut shadow-xl">
        
        {/* Left: View Mode Selectors (Terminal Comms vs Gangs Dossier vs Tactical Grid) */}
        <div className="flex items-center gap-1.5 bg-[#07080D] p-1 border border-slate-800 cyber-cut text-xs font-cyber">
          <button
            onClick={() => handleViewModeChange('terminal')}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-all cyber-cut ${
              viewMode === 'terminal'
                ? 'bg-[#00F0FF] text-black font-black shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Terminal Comms Split-View (cyberpunkredone.webflow.io style)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TERMINAL COMMS</span>
          </button>

          <button
            onClick={() => handleViewModeChange('dossier')}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-all cyber-cut ${
              viewMode === 'dossier'
                ? 'bg-[#FCEE0A] text-black font-black shadow-[0_0_12px_rgba(252,238,10,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Gangs Dossier Horizontal Scroll (cyberpunk2077-gangs.webflow.io style)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GANGS DOSSIER</span>
          </button>

          <button
            onClick={() => handleViewModeChange('grid')}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-all cyber-cut ${
              viewMode === 'grid'
                ? 'bg-[#FF003C] text-white font-black shadow-[0_0_12px_rgba(255,0,60,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tactical Operations Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GRID MATRIX</span>
          </button>
        </div>

        {/* Right: New Directive Action Button (video-bg-button.webflow.io style) */}
        <CyberVideoBtn
          onClick={onAddClick}
          variant="yellow"
          icon={<Plus className="w-4 h-4 stroke-[3]" />}
          subtitle="MULTI-CADENCE AUTO EMAIL"
        >
          {uiMode === 'serious' ? 'INITIALIZE NEW DIRECTIVE' : 'ADD NEW TASK // LOCK IN'}
        </CyberVideoBtn>

      </div>

      {/* 2. Category Skew Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-cyber">
        {(
          [
            { id: 'all', label: 'ALL FREQUENCIES' },
            { id: 'work', label: '[INTERN & WORK]' },
            { id: 'cert', label: '[CERT BLUEPRINTS]' },
            { id: 'freelance', label: '[FREELANCE GIGS]' },
            { id: 'life', label: '[LIFE & NEURAL]' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleFilterClick(tab.id)}
            className={`px-3 py-1.5 font-bold tracking-wider transition-all cyber-skew-tab ${
              filterTheme === tab.id
                ? 'bg-[#FCEE0A] text-black shadow-[0_0_12px_rgba(252,238,10,0.6)]'
                : 'bg-[#141622] text-slate-300 hover:text-[#00F0FF] hover:bg-[#1C1F30]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Empty State if no directives exist */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0A0C14]/90 border-2 border-dashed border-slate-800 cyber-cut">
          <TechBadge mode={uiMode} type="dog" size="lg" />
          <h3 className="mt-4 font-cyber text-sm font-bold text-[#FCEE0A] uppercase tracking-wider">
            NO DIRECTIVES FOUND IN ACTIVE QUEUE
          </h3>
          <p className="mt-1 text-xs font-tech text-slate-400 max-w-md mx-auto">
            Arm the 24/7 autonomous background scheduler with daily, weekday, 2-day, or random reminders.
          </p>
          <div className="mt-4">
            <CyberVideoBtn onClick={onAddClick} variant="cyan">
              [+ INITIALIZE FIRST DIRECTIVE]
            </CyberVideoBtn>
          </div>
        </div>
      ) : viewMode === 'terminal' ? (
        
        /* =========================================================================
           VIEW MODE 1: TERMINAL COMMS (Inspired by cyberpunkredone.webflow.io)
           ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Left Column: Directives / Messages Rail (like cyberpunkredone .msg-list) */}
          <div className="md:col-span-5 space-y-2 bg-[#090A12]/95 border-2 border-slate-800 cyber-cut-card p-3 max-h-[580px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-tech text-xs">
              <span className="text-[#00F0FF] font-bold">TERMINAL CHANNELS [{filtered.length}]</span>
              <span className="text-slate-500">RESEND AUTO-LINK</span>
            </div>

            {filtered.map((item) => {
              const meta = getThemeMeta(item.theme);
              const isSelected = activeReminder?.id === item.id;
              const isPaused = item.status === 'paused';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    playCyberClick();
                    setSelectedReminderId(item.id);
                  }}
                  className={`p-3 border transition-all cursor-pointer cyber-cut relative ${
                    isSelected
                      ? 'bg-[#121626] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-[#0B0D16] border-slate-800/80 hover:border-slate-600'
                  } ${isPaused ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[9px] font-cyber px-2 py-0.5 uppercase cyber-cut ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-tech text-[#FCEE0A] font-bold">
                      {item.cadence === 'random'
                        ? 'RANDOM 10A-11P'
                        : item.cadence === 'interval'
                        ? `EVERY ${item.intervalDays}D`
                        : item.cadence === 'weekdays'
                        ? `WEEKDAYS @ ${item.time}`
                        : `DAILY @ ${item.time}`}
                    </span>
                  </div>

                  <h4 className="font-hud text-sm font-bold text-white truncate group-hover:text-[#FCEE0A]">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between mt-1 text-[10px] font-tech text-slate-400">
                    <span className="truncate max-w-[140px]">{item.email}</span>
                    <span className={item.autoEmail ? 'text-[#1CED82]' : 'text-slate-500'}>
                      {item.autoEmail ? 'AUTO-DISPATCH' : 'MUTED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Decrypted Transmission HUD (like cyberpunkredone .msg-body) */}
          <div className="md:col-span-7 bg-[#07080D]/95 border-2 border-[#00F0FF] cyber-cut-card p-5 relative shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-col justify-between">
            {/* Top Hazard Accent */}
            <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe-cyan" />

            {activeReminder ? (
              (() => {
                const meta = getThemeMeta(activeReminder.theme);
                const nextDate = new Date(activeReminder.nextTriggerAt);
                const formattedNext = isNaN(nextDate.getTime())
                  ? 'Autonomous 24/7'
                  : nextDate.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                return (
                  <div className="space-y-4">
                    
                    {/* Header Protocol */}
                    <div className="border-b border-slate-800 pb-3">
                      <div className="text-[10px] font-tech text-[#00F0FF] uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>DECRYPTED TRANSMISSION PROTOCOL // V-2077</span>
                      </div>
                      <h3 className="font-cyber text-lg font-black text-white glitch-text" data-text={activeReminder.title}>
                        {activeReminder.title}
                      </h3>
                    </div>

                    {/* From / To Metadata (matching cyberpunkredone) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0A0C16] p-3 border border-slate-800/80 cyber-cut">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF]">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] font-tech text-slate-400 block uppercase">FROM: TRANSMITTER</span>
                          <span className="text-xs font-hud font-bold text-white">{meta.sender}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#FCEE0A]/15 border border-[#FCEE0A]/40 text-[#FCEE0A]">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] font-tech text-slate-400 block uppercase">TO: RECIPIENT</span>
                          <span className="text-xs font-hud font-bold text-[#FCEE0A]">
                            CYBERSURFER // {activeReminder.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cadence Telemetry Readout */}
                    <div className="bg-[#05060B] p-3 border-l-2 border-[#FCEE0A] font-tech text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">DISPATCH CADENCE:</span>
                        <span className="text-[#FCEE0A] font-bold">
                          {activeReminder.cadence === 'random'
                            ? 'RANDOM INTERVALS (10:00 AM - 11:00 PM)'
                            : activeReminder.cadence === 'interval'
                            ? `EVERY ${activeReminder.intervalDays} DAYS @ ${activeReminder.time}`
                            : activeReminder.cadence === 'weekdays'
                            ? `WEEKDAYS ONLY @ ${activeReminder.time}`
                            : `DAILY SCHEDULED @ ${activeReminder.time}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">NEXT BACKGROUND EXECUTION:</span>
                        <span className="text-[#00FF66] font-bold">{formattedNext}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">RESEND AUTO-EMAIL ENGINE:</span>
                        <span className={activeReminder.autoEmail ? 'text-[#00F0FF]' : 'text-slate-500'}>
                          {activeReminder.autoEmail ? 'ONLINE [24/7 BACKGROUND DAEMON]' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>

                    {/* Message Body with Blinking Typewriter Cursor (cyberpunkredone) */}
                    <div className="bg-[#090B14] p-4 border border-slate-800 cyber-cut">
                      <div className="text-[10px] font-tech text-slate-500 mb-2 uppercase">
                        TRANSMISSION BODY // DECRYPTED SHARD
                      </div>
                      <p className="font-hud text-sm text-slate-200 leading-relaxed typed-words whitespace-pre-line">
                        {activeReminder.description ||
                          `Attention Operator: This directive is actively monitored by your 24/7 background scheduler. When the scheduled trigger hits, automated dispatches will fire to your inbox at ${activeReminder.email}. Stay vigilant in Night City.`}
                      </p>
                    </div>

                    {/* Action Deck with Video-Background Button */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <CyberVideoBtn
                        onClick={() => handleInstantTrigger(activeReminder.id)}
                        disabled={triggeringId === activeReminder.id}
                        variant="yellow"
                        icon={<Send className="w-4 h-4" />}
                        subtitle="TEST RESEND DISPATCH NOW"
                      >
                        {triggeringId === activeReminder.id ? 'PING DISPATCHED!' : 'DISPATCH PING NOW'}
                      </CyberVideoBtn>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            playCyberClick();
                            onToggleStatus(activeReminder.id, activeReminder.status);
                          }}
                          className="px-3 py-2 border border-slate-700 hover:border-slate-400 text-xs font-tech font-bold cyber-cut text-slate-300"
                        >
                          {activeReminder.status === 'paused' ? (
                            <>
                              <Play className="w-3.5 h-3.5 inline mr-1 text-[#00FF66]" />
                              RESUME
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 inline mr-1 text-[#FCEE0A]" />
                              PAUSE
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            playCyberGlitch();
                            onDelete(activeReminder.id);
                          }}
                          className="p-2 border border-slate-700 hover:border-[#FF003C] hover:bg-[#FF003C]/10 text-slate-400 hover:text-[#FF003C] cyber-cut"
                          title="Eject directive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()
            ) : (
              <div className="p-8 text-center text-slate-500 font-tech">
                Select a directive from the left channels to inspect.
              </div>
            )}
          </div>

        </div>
      ) : viewMode === 'dossier' ? (
        
        /* =========================================================================
           VIEW MODE 2: GANGS DOSSIER HORIZONTAL SCROLL (cyberpunk2077-gangs.webflow.io)
           ========================================================================= */
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#00F0FF] pb-2 mb-2">
            <h3 className="font-cyber text-sm font-black text-white uppercase tracking-wider">
              NIGHT CITY GANGS // <span className="text-[#00F0FF]">OPERATIONAL DOSSIER MATRIX</span>
            </h3>
            <span className="font-tech text-xs text-[#FCEE0A]">
              [SWIPE / SCROLL HORIZONTALLY]
            </span>
          </div>

          <div className="cyber-dossier-scroll scrollbar-cyan">
            {filtered.map((item) => {
              const meta = getThemeMeta(item.theme);
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
                  className="cyber-dossier-card p-5 flex flex-col justify-between group"
                >
                  {/* Top Bar with Icon & District */}
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <span className={`text-[9px] font-cyber px-2.5 py-0.5 uppercase cyber-cut ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-tech text-slate-400 font-bold">
                        {meta.district.split('//')[0]}
                      </span>
                    </div>

                    <h4 className="font-hud text-lg font-bold text-white group-hover:text-[#FCEE0A] transition-colors leading-tight mb-2">
                      {item.title}
                    </h4>

                    <p className="font-tech text-xs text-slate-300 line-clamp-3 bg-[#07080E] p-2.5 border-l-2 border-[#00F0FF]">
                      {item.description || 'Continuous background monitoring active for this sector.'}
                    </p>
                  </div>

                  {/* Card Bottom: Cadence, Execution, and Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                      <span>CADENCE:</span>
                      <span className="text-[#FCEE0A] font-bold">
                        {item.cadence === 'random' ? 'RANDOM 10A-11P' : item.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                      <span>NEXT DISPATCH:</span>
                      <span className="text-[#00FF66] font-bold">{formattedNext}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleInstantTrigger(item.id)}
                        disabled={triggeringId === item.id}
                        className="w-full py-1.5 cyber-btn-yellow text-[10px] font-black flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>{triggeringId === item.id ? 'PINGED!' : 'TRIGGER PING'}</span>
                      </button>

                      <button
                        onClick={() => {
                          playCyberGlitch();
                          onDelete(item.id);
                        }}
                        className="p-1.5 border border-slate-700 hover:border-[#FF003C] hover:text-[#FF003C] cyber-cut text-slate-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        
        /* =========================================================================
           VIEW MODE 3: TACTICAL 2-COLUMN GRID (Operations Matrix)
           ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isPaused = item.status === 'paused';
            const meta = getThemeMeta(item.theme);
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
                className={`p-5 bg-[#090A12]/95 border-2 cyber-cut-card transition-all relative overflow-hidden flex flex-col justify-between ${
                  isPaused
                    ? 'border-slate-800 opacity-60'
                    : 'border-slate-700/80 hover:border-[#FCEE0A] shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(252,238,10,0.25)]'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-2 hazard-stripe" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-cyber px-2.5 py-0.5 tracking-wider uppercase cyber-cut ${meta.badge}`}>
                      {meta.label}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] font-tech text-[#FCEE0A] bg-[#161824] px-2.5 py-0.5 border border-[#FCEE0A]/40 cyber-cut">
                      {item.cadence === 'random' ? (
                        <>
                          <Shuffle className="w-3.5 h-3.5 text-[#FF003C]" />
                          <span className="text-[#FF003C] font-bold">RANDOM 10A-11P</span>
                        </>
                      ) : item.cadence === 'interval' ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-[#FCEE0A]" />
                          <span>EVERY {item.intervalDays}D @ {item.time}</span>
                        </>
                      ) : item.cadence === 'weekdays' ? (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                          <span className="text-[#00F0FF]">WEEKDAYS @ {item.time}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-[#00FF66]" />
                          <span className="text-[#00FF66]">DAILY @ {item.time}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <h4 className="font-hud text-lg font-bold text-white tracking-wide leading-tight group-hover:text-[#FCEE0A] transition-colors">
                    {item.title}
                  </h4>

                  {item.description && (
                    <div className="mt-2.5 p-3 bg-[#05060A] border-l-2 border-slate-700 font-tech text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">
                      {item.description}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-tech text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span className="truncate max-w-[140px] text-slate-300" title={item.email}>
                        {item.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">NEXT:</span>
                      <span className="text-[#FCEE0A] font-bold">{formattedNext}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handleInstantTrigger(item.id)}
                      disabled={triggeringId === item.id}
                      className="px-3.5 py-1.5 cyber-btn-yellow text-[11px] font-black tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
                      title="Dispatch test reminder email immediately to verify delivery"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{triggeringId === item.id ? 'PING SENT!' : 'DISPATCH PING'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playCyberClick();
                          onToggleStatus(item.id, item.status);
                        }}
                        className={`px-2.5 py-1.5 cyber-cut border text-xs font-tech font-bold transition-colors ${
                          isPaused
                            ? 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10'
                            : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                        title={isPaused ? 'Resume Directive' : 'Pause Directive'}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5 inline mr-1" /> : <Pause className="w-3.5 h-3.5 inline mr-1" />}
                        <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                      </button>

                      <button
                        onClick={() => {
                          playCyberGlitch();
                          onDelete(item.id);
                        }}
                        className="p-1.5 cyber-cut border border-slate-700 text-slate-400 hover:text-[#FF003C] hover:border-[#FF003C] hover:bg-[#FF003C]/10 transition-colors"
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
