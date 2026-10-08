// CyberHeader: Cyberpunk Cockpit HUD Header
// STRICT: No yellow emojis. Uses Lucide vector icons and monospace text badges.

import { useState, useEffect } from 'react';
import { DaemonStatus, CyberProfile, UiMode } from '../types';
import { Sliders, Bell, Terminal, Activity } from 'lucide-react';
import { TechBadge } from './TechBadge';

interface CyberHeaderProps {
  profile: CyberProfile;
  daemonStatus: DaemonStatus;
  uiMode: UiMode;
  bandwidthPercent: number;
  onToggleMode: () => void;
  onOpenSettings: () => void;
  onOpenOutbox: () => void;
}

export function CyberHeader({
  profile,
  daemonStatus,
  uiMode,
  bandwidthPercent,
  onToggleMode,
  onOpenSettings,
  onOpenOutbox,
}: CyberHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#080D1A]/85 border-b border-cyan-500/25 px-4 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Terminal Brand & Persona */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.35)]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
                  CYBERPULSE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  v2.4_NEURAL
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-300 tracking-wide">
                {profile.name} // <span className="text-cyan-300 font-mono text-[11px]">STUDENT &bull; INTERN &bull; FREELANCER</span>
              </p>
            </div>
          </div>

          {/* Quick status pill on mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleMode}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wider transition-all ${
                uiMode === 'serious'
                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                  : 'bg-pink-950/80 text-pink-400 border border-pink-500/40 shadow-neon-pink'
              }`}
            >
              {uiMode === 'serious' ? '[SERIOUS]' : '[MEME MODE]'}
            </button>
          </div>
        </div>

        {/* Center: Live 24/7 Daemon Telemetry & Clock */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Clock */}
          <div className="px-3 py-1.5 rounded-lg bg-[#050811]/90 border border-slate-700/60 text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-bold">{timeStr || '00:00:00'}</span>
          </div>

          {/* 24/7 Daemon Status */}
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${
              daemonStatus.online
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(0,255,102,0.15)]'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                daemonStatus.online ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-[11px]">
              {daemonStatus.online ? '24/7 DAEMON: ONLINE' : 'LOCAL CACHE SYNC'}
            </span>
          </div>

          {/* Bandwidth meter */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">LOAD:</span>
            <span
              className={`font-bold text-[11px] ${
                bandwidthPercent > 80
                  ? 'text-pink-400'
                  : bandwidthPercent > 50
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {bandwidthPercent}%
            </span>
          </div>
        </div>

        {/* Right: Actions, Mode Toggle, Settings */}
        <div className="flex items-center gap-2.5">
          {/* Serious vs Fun/Meme Mode Toggle (Desktop) */}
          <button
            onClick={onToggleMode}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all ${
              uiMode === 'serious'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/40'
                : 'bg-pink-950/80 text-pink-300 border border-pink-500/50 shadow-neon-pink hover:bg-pink-900/40'
            }`}
          >
            <TechBadge mode={uiMode} type="cat" size="sm" />
            <span>{uiMode === 'serious' ? 'MODE: SERIOUS HUD' : 'MODE: FUN / MEME'}</span>
          </button>

          {/* Outbox / Logs */}
          <button
            onClick={onOpenOutbox}
            className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
            title="View 24/7 Email Outbox Logs"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
            title="Configure System & Profile"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
