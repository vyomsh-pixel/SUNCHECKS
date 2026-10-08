// ReminderMatrix: Cyberpunk 2077 Gig & Contract Operations Grid
// Features chamfered cards, yellow hazard stripes, quest status bars, and audio feedback.
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
import { playCyberClick, playCyberAlert, playCyberGlitch } from '../cyberAudio';

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
    playCyberAlert();
    setTriggeringId(id);
    await onTriggerNow(id);
    setTimeout(() => setTriggeringId(null), 1800);
  };

  const handleFilterClick = (theme: ReminderTheme | 'all') => {
    playCyberClick();
    setFilterTheme(theme);
  };

  const getGigThemeStyles = (theme: ReminderTheme) => {
    switch (theme) {
      case 'work':
        return {
          border: 'border-l-4 border-l-[#00F0FF] border-slate-800',
          badge: 'bg-[#00F0FF] text-black font-extrabold',
          accent: 'text-[#00F0FF]',
          label: 'GIG // INTERN_WORK',
        };
      case 'cert':
        return {
          border: 'border-l-4 border-l-[#FCEE0A] border-slate-800',
          badge: 'bg-[#FCEE0A] text-black font-extrabold',
          accent: 'text-[#FCEE0A]',
          label: 'CONTRACT // CLOUD_CERT',
        };
      case 'freelance':
        return {
          border: 'border-l-4 border-l-[#FF003C] border-slate-800',
          badge: 'bg-[#FF003C] text-white font-extrabold',
          accent: 'text-[#FF003C]',
          label: 'SIDE_GIG // FREELANCE',
        };
      case 'life':
        return {
          border: 'border-l-4 border-l-[#00FF66] border-slate-800',
          badge: 'bg-[#00FF66] text-black font-extrabold',
          accent: 'text-[#00FF66]',
          label: 'MAINTENANCE // NEURAL_RESET',
        };
    }
  };

  const randomQuote = FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)];

  return (
    <div className="space-y-5">
      
      {/* Top Banner: Sarcastic Netrunner Checkin or Tactical Directives Matrix */}
      {uiMode === 'fun' ? (
        <div className="p-4 bg-[#14060E] border-2 border-[#FF003C] cyber-cut relative overflow-hidden shadow-[0_0_20px_rgba(255,0,60,0.3)]">
          <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#FF003C]" />
          <div className="flex items-center gap-3">
            <TechBadge mode="fun" type="cat" size="md" />
            <div>
              <span className="text-[10px] font-cyber font-bold tracking-widest text-[#FF003C] uppercase">
                NETRUNNER REALITY CHECK // 2077
              </span>
              <p className="text-sm font-hud font-bold text-pink-200 mt-0.5">
                "{randomQuote}"
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-[#0A0C14] border-2 border-[#00F0FF]/60 cyber-cut flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00F0FF] animate-ping" />
            <span className="font-cyber text-xs font-black tracking-widest text-[#00F0FF] uppercase">
              OPERATIONAL GIG MATRIX // NIGHT CITY DISPATCH PROTOCOL
            </span>
          </div>
          <div className="flex items-center gap-2 font-tech text-xs text-slate-300">
            <span className="text-[#FCEE0A] font-bold">{reminders.filter((r) => r.status === 'active').length} ACTIVE GIGS</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#00FF66]">DAEMON_24_7_HEARTBEAT</span>
          </div>
        </div>
      )}

      {/* Control Bar: Category Filters & Initialize CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D0F18]/90 p-3.5 border-t-2 border-[#FCEE0A] cyber-cut shadow-lg">
        
        {/* Category Pills (Cyberpunk Skewed Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-cyber">
          {(
            [
              { id: 'all', label: 'ALL GIGS' },
              { id: 'work', label: '[WORK]' },
              { id: 'cert', label: '[CERT]' },
              { id: 'freelance', label: '[FREELANCE]' },
              { id: 'life', label: '[LIFE]' },
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

        {/* Big Yellow Cyberpunk New Gig CTA */}
        <button
          onClick={() => {
            playCyberClick();
            onAddClick();
          }}
          className="w-full sm:w-auto px-5 py-2.5 cyber-btn-yellow text-xs font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,238,10,0.5)]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{uiMode === 'serious' ? 'INITIALIZE NEW GIG' : 'NEW TASK // LOCK IN'}</span>
        </button>

      </div>

      {/* Gigs & Contracts Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0A0C14]/90 border-2 border-dashed border-slate-800 cyber-cut">
          <TechBadge mode={uiMode} type="dog" size="lg" />
          <h3 className="mt-4 font-cyber text-sm font-bold text-[#FCEE0A] uppercase tracking-wider">
            {uiMode === 'serious'
              ? 'NO DIRECTIVES FOUND IN ACTIVE QUEUE'
              : 'ZERO TASKS FOUND // YOU SLACKING CHOOM?'}
          </h3>
          <p className="mt-1 text-xs font-tech text-slate-400 max-w-md mx-auto">
            {uiMode === 'serious'
              ? 'Add an operational reminder to arm the 24/7 background scheduler.'
              : 'Add your study certs or intern tickets before your boss messages you.'}
          </p>
          <button
            onClick={() => {
              playCyberClick();
              onAddClick();
            }}
            className="mt-4 px-5 py-2 cyber-btn-cyan text-xs font-bold"
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

            const gigStyle = getGigThemeStyles(item.theme);

            return (
              <div
                key={item.id}
                className={`p-5 bg-[#090A12]/95 border-2 cyber-cut-card transition-all relative overflow-hidden flex flex-col justify-between ${
                  isPaused
                    ? 'border-slate-800 opacity-60'
                    : 'border-slate-700/80 hover:border-[#FCEE0A] shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(252,238,10,0.25)]'
                }`}
              >
                {/* Top Corner Hazard Stripe Accent */}
                <div className="absolute top-0 right-0 w-24 h-2 hazard-stripe" />

                <div>
                  {/* Gig Header & Cadence Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-cyber px-2.5 py-0.5 tracking-wider uppercase cyber-cut ${gigStyle.badge}`}>
                      {gigStyle.label}
                    </span>

                    {/* Cadence Tag */}
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

                  {/* Title */}
                  <h4 className="font-hud text-lg font-bold text-white tracking-wide leading-tight group-hover:text-[#FCEE0A] transition-colors">
                    {item.title}
                  </h4>

                  {/* Description Box */}
                  {item.description && (
                    <div className="mt-2.5 p-3 bg-[#05060A] border-l-2 border-slate-700 font-tech text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">
                      {item.description}
                    </div>
                  )}
                </div>

                {/* Footer Telemetry & Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col gap-3">
                  
                  {/* Target Inbox & Next Execution */}
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

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    
                    {/* Yellow Test Email Trigger CTA */}
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
                      {/* Pause / Resume */}
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

                      {/* Delete */}
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
