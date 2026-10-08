// ReminderMatrix: Authentic cyberpunkredone.webflow.io In-Game Terminal Interface
// Features:
// 1. Sleek semi-transparent cyber glass frame floating over the visible wallpaper.
// 2. Left rail: msg-list with Rectangle 2.svg / Rectangle 138.svg backgrounds and authentic msg-icon.png.
// 3. Right pane: msg-body with From / To vector badges, glowing titles, and typewriter cursor.
// 4. Multi-cadence 24/7 background scheduler integration and Resend email triggers.
// STRICT: No yellow emojis. Clean vectors and monospace readouts.

import { useState } from 'react';
import { ReminderItem, ReminderTheme, UiMode } from '../types';
import {
  Send,
  Trash2,
  Play,
  Pause,
  Plus,
} from 'lucide-react';
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

export function ReminderMatrix({
  reminders,
  uiMode,
  onAddClick,
  onToggleStatus,
  onDelete,
  onTriggerNow,
}: ReminderMatrixProps) {
  const [filterTheme, setFilterTheme] = useState<ReminderTheme | 'all'>('all');
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const filtered =
    filterTheme === 'all'
      ? reminders
      : reminders.filter((r) => r.theme === filterTheme);

  // Active reminder selection
  const activeReminder =
    filtered.find((r) => r.id === selectedReminderId) || filtered[0] || null;

  const handleInstantTrigger = async (id: string) => {
    playCyberAlert();
    setTriggeringId(id);
    await onTriggerNow(id);
    setTimeout(() => setTriggeringId(null), 2000);
  };

  const handleFilterClick = (theme: ReminderTheme | 'all') => {
    playCyberClick();
    setFilterTheme(theme);
  };

  const getThemeSender = (theme: ReminderTheme) => {
    if (uiMode === 'serious') {
      switch (theme) {
        case 'work':
          return 'Work & Internship Schedule';
        case 'cert':
          return 'Cloud Certifications & Study';
        case 'freelance':
          return 'Freelance Client Deliverables';
        case 'life':
          return 'Daily Routine & Wellbeing';
      }
    }
    switch (theme) {
      case 'work':
        return 'Corpo Grind // Intern Overlord';
      case 'cert':
        return 'Netrunner Shard Academy // Brain Melting';
      case 'freelance':
        return 'Muamar "El Capitán" Reyes // Street Hustle';
      case 'life':
        return 'Biomonitor // Don\'t Flatline Yet';
    }
  };

  return (
    <div className="w-full">
      
      {/* Authentic cyberpunkredone.webflow.io Terminal Container */}
      <div className="cyber-redone-container p-4 md:p-8 relative min-h-[620px] flex flex-col justify-between">
        
        {/* Top Header Controls: Filter Skew Tabs & Add Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#00F0FF]/30 pb-4 mb-6">
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto font-hud text-sm">
            {(
              [
                { id: 'all', label: uiMode === 'serious' ? 'ALL REMINDERS' : 'ALL GIGS' },
                { id: 'work', label: uiMode === 'serious' ? 'WORK & INTERN' : 'CORPO SLAVE' },
                { id: 'cert', label: uiMode === 'serious' ? 'CERTIFICATIONS' : 'SHARD STUDY' },
                { id: 'freelance', label: uiMode === 'serious' ? 'FREELANCE' : 'SIDE HUSTLE' },
                { id: 'life', label: uiMode === 'serious' ? 'DAILY LIFE' : 'SURVIVAL' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterClick(tab.id)}
                className={`px-3 py-1 uppercase tracking-wider transition-all cyber-cut ${
                  filterTheme === tab.id
                    ? 'bg-[#00F0FF] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                    : 'text-[#29ffff]/80 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* New Reminder CTA */}
          <CyberVideoBtn
            onClick={onAddClick}
            variant="yellow"
            icon={<Plus className="w-4 h-4 stroke-[3]" />}
            subtitle="24/7 AUTO-EMAIL DISPATCH"
          >
            {uiMode === 'serious' ? 'NEW REMINDER' : 'ADD TASK // LOCK IN'}
          </CyberVideoBtn>

        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="font-hud text-2xl font-bold text-cyber-glow uppercase">
              NO DIRECTIVES IN CURRENT SECTOR
            </h3>
            <p className="mt-2 text-sm font-tech text-slate-300 max-w-md mx-auto">
              Initialize a schedule to arm your 24/7 autonomous background dispatcher.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  playCyberClick();
                  onAddClick();
                }}
                className="px-6 py-2.5 cyber-btn-yellow text-sm font-bold"
              >
                [+ INITIALIZE FIRST DIRECTIVE]
              </button>
            </div>
          </div>
        ) : (

          /* Split-View Terminal (Matching cyberpunkredone.webflow.io) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
            
            {/* Left Rail: Messages Queue (.msg-list) */}
            <div className="md:col-span-5 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              <div className="text-[11px] font-tech text-[#00F0FF] tracking-widest uppercase mb-1">
                {uiMode === 'serious'
                  ? `SCHEDULED REMINDERS & TASKS [${filtered.length}]`
                  : `INCOMING TERMINAL CHANNELS [${filtered.length}]`}
              </div>

              {filtered.map((item) => {
                const isSelected = activeReminder?.id === item.id;
                const isPaused = item.status === 'paused';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playCyberClick();
                      setSelectedReminderId(item.id);
                    }}
                    className={`p-3.5 cursor-pointer cyber-redone-msg-item flex items-center justify-between gap-3 ${
                      isSelected ? 'active' : ''
                    } ${isPaused ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src="https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6675937c5470cee744aec832_msg-icon.png"
                        alt="msg-icon"
                        className="w-6 h-6 object-contain flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-hud text-base font-semibold truncate text-white">
                          {item.title}
                        </h4>
                        <span className="font-tech text-xs text-[#FCEE0A] block">
                          {item.cadence === 'random'
                            ? 'RANDOM 10A - 11P'
                            : item.cadence === 'interval'
                            ? `EVERY ${item.intervalDays} DAYS`
                            : item.cadence === 'weekdays'
                            ? `WEEKDAYS @ ${item.time}`
                            : `DAILY @ ${item.time}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-tech text-[#1CED82] block">
                        {item.autoEmail ? 'AUTO-LINK' : 'MUTED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Pane: Decrypted Message Body (.msg-body _1000 blu) */}
            <div className="md:col-span-7 bg-[#070912]/80 border border-[#00F0FF]/40 p-6 cyber-cut relative flex flex-col justify-between shadow-[0_0_25px_rgba(0,240,255,0.15)]">
              
              {activeReminder ? (
                (() => {
                  const sender = getThemeSender(activeReminder.theme);
                  const nextDate = new Date(activeReminder.nextTriggerAt);
                  const formattedNext = isNaN(nextDate.getTime())
                    ? 'Active 24/7 in background'
                    : nextDate.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                  return (
                    <div className="space-y-5">
                      
                      {/* Message Title (Exact cyberpunkredone styling) */}
                      <div>
                        <span className="text-[10px] font-tech text-[#00F0FF] uppercase tracking-widest block mb-1">
                          {uiMode === 'serious'
                            ? 'REMINDER DETAILS & CADENCE // 24/7 ENGINE'
                            : 'TERMINAL DECRYPTION PROTOCOL // 2077'}
                        </span>
                        <h3 className="font-hud text-3xl font-black text-cyber-glow leading-tight">
                          {activeReminder.title}
                        </h3>
                      </div>

                      {/* From & To Sender Badges (Matching cyberpunkredone.webflow.io) */}
                      <div className="space-y-2 border-y border-slate-800/80 py-3 font-hud">
                        
                        {/* FROM ROW */}
                        <div className="flex items-center gap-3">
                          <span className="font-tech text-xs text-[#096168] font-bold w-12 uppercase">
                            From:
                          </span>
                          <div className="flex items-center gap-2 text-[#e0f9f3] text-sm font-semibold">
                            <img
                              src="https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6675963d56805f825ff08303_Vector.png"
                              alt="Sender avatar"
                              className="w-4 h-4 object-contain"
                            />
                            <span>{sender}</span>
                          </div>
                        </div>

                        {/* TO ROW */}
                        <div className="flex items-center gap-3">
                          <span className="font-tech text-xs text-[#096168] font-bold w-12 uppercase">
                            To:
                          </span>
                          <div className="flex items-center gap-2 text-[#FCEE0A] text-sm font-semibold">
                            <img
                              src="https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6675963dada469637bc2ef4e_Group%2024.png"
                              alt="Recipient avatar"
                              className="w-4 h-4 object-contain"
                            />
                            <span>{uiMode === 'serious' ? 'OPERATOR' : 'CYBERSURFER'} // {activeReminder.email}</span>
                          </div>
                        </div>

                      </div>

                      {/* Cadence Telemetry Chip */}
                      <div className="bg-[#04060B] border-l-2 border-[#FCEE0A] p-3 font-tech text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>CADENCE:</span>
                          <span className="text-[#FCEE0A] font-bold">
                            {activeReminder.cadence === 'random'
                              ? 'RANDOM INTERVALS (10:00 AM - 11:00 PM)'
                              : activeReminder.cadence === 'interval'
                              ? `EVERY ${activeReminder.intervalDays} DAYS @ ${activeReminder.time}`
                              : activeReminder.cadence === 'weekdays'
                              ? `WEEKDAYS @ ${activeReminder.time}`
                              : `DAILY @ ${activeReminder.time}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>NEXT SCHEDULED DISPATCH:</span>
                          <span className="text-[#00FF66] font-bold">{formattedNext}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>AUTONOMOUS ENGINE:</span>
                          <span className="text-[#00F0FF] font-bold">RESEND 24/7 BACKGROUND DAEMON</span>
                        </div>
                      </div>

                      {/* Decrypted Transmission Body with Typewriter Cursor */}
                      <div className="pt-2">
                        <p className="font-hud text-lg text-cyber-body leading-relaxed whitespace-pre-line typed-words">
                          {activeReminder.description ||
                            (uiMode === 'serious'
                              ? `Automated reminder scheduled for delivery to ${activeReminder.email}. Running 24/7 in background to keep you on track with work, internships, and cloud certification goals.`
                              : `Hey Choomba,\n\nThis directive is armed and running inside your 24/7 background scheduler. When the scheduled trigger hits, automated dispatches will fire straight to your inbox at ${activeReminder.email}.\n\nStay sharp,\nPixelWitch`)}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => handleInstantTrigger(activeReminder.id)}
                          disabled={triggeringId === activeReminder.id}
                          className="px-5 py-2.5 cyber-btn-yellow text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(252,238,10,0.5)] disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>
                            {triggeringId === activeReminder.id
                              ? 'DISPATCHED TO INBOX!'
                              : 'TRIGGER TEST DISPATCH'}
                          </span>
                        </button>

                        <div className="flex items-center gap-2 font-hud text-xs">
                          <button
                            onClick={() => {
                              playCyberClick();
                              onToggleStatus(activeReminder.id, activeReminder.status);
                            }}
                            className={`px-3 py-2 cyber-cut border transition-all ${
                              activeReminder.status === 'paused'
                                ? 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10'
                                : 'border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                            }`}
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
                            className="p-2 border border-slate-700 hover:border-[#FF003C] hover:text-[#FF003C] text-slate-400 cyber-cut transition-colors"
                            title={uiMode === 'serious' ? 'Delete Reminder' : 'Delete Directive'}
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
                  {uiMode === 'serious'
                    ? 'Select a reminder from the schedule list to inspect details.'
                    : 'Select a message from the terminal queue.'}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
