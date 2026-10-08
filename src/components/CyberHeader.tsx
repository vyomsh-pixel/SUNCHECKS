// CyberHeader: Cyberpunk 2077 Cockpit HUD Header
// Features glitch title, Cyberpunk yellow branding, technical coordinates,
// Web Audio sound toggle, and angular chamfered status blocks.

import { useState, useEffect } from 'react';
import { DaemonStatus, CyberProfile, UiMode } from '../types';
import { Sliders, Bell, Volume2, VolumeX, Terminal, Activity, Radio } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { playCyberClick, playCyberGlitch, isCyberAudioMuted, setCyberAudioMuted } from '../cyberAudio';

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
  const [muted, setMuted] = useState(isCyberAudioMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioToggle = () => {
    const next = !muted;
    setMuted(next);
    setCyberAudioMuted(next);
    if (!next) playCyberClick();
  };

  const handleModeClick = () => {
    playCyberGlitch();
    onToggleMode();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080D]/95 border-b-2 border-[#FCEE0A] px-4 py-2.5 shadow-[0_4px_30px_rgba(252,238,10,0.15)] relative">
      {/* Top micro hazard stripe line */}
      <div className="absolute top-0 left-0 right-0 h-1 hazard-stripe opacity-80" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
        
        {/* Left: Cyberpunk 2077 Glitch Brand & Operator Callsign */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Terminal Icon Box with cut corner */}
            <div className="w-10 h-10 bg-[#FCEE0A] text-black flex items-center justify-center font-black cyber-cut shadow-[0_0_15px_rgba(252,238,10,0.5)]">
              <Terminal className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  data-text="CYBERPULSE"
                  className="font-cyber text-base font-black tracking-widest text-[#FCEE0A] glitch-text uppercase"
                >
                  CYBERPULSE
                </span>
                <span className="text-[10px] font-cyber px-2 py-0.5 bg-[#00F0FF] text-black font-extrabold tracking-wider cyber-cut">
                  2077 // V2
                </span>
              </div>
              <p className="text-[11px] font-tech text-slate-300 tracking-wider flex items-center gap-1.5 mt-0.5">
                <span className="text-[#00F0FF] font-bold">OP: {profile.name.toUpperCase()}</span>
                <span className="text-slate-500">//</span>
                <span className="text-[#FCEE0A] font-bold">STUDENT &bull; INTERN &bull; FREELANCER</span>
              </p>
            </div>
          </div>

          {/* Mobile Quick Mode Toggle */}
          <button
            onClick={handleModeClick}
            className={`md:hidden px-3 py-1 text-xs font-cyber font-bold tracking-wider cyber-cut ${
              uiMode === 'serious'
                ? 'bg-[#00F0FF] text-black'
                : 'bg-[#FF003C] text-white shadow-[0_0_12px_rgba(255,0,60,0.6)]'
            }`}
          >
            {uiMode === 'serious' ? 'SERIOUS' : 'MEME'}
          </button>
        </div>

        {/* Center: System Telemetry, Coordinates, & Daemon Status */}
        <div className="flex items-center gap-3 text-xs font-tech">
          
          {/* Night City Clock & Lat/Lng */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-[#0D0F18] border-l-2 border-[#00F0FF] text-slate-300">
            <span className="text-[9px] text-slate-500 tracking-widest">NIGHT_CITY_LOCAL</span>
            <span className="text-[#00F0FF] font-bold tracking-wider">{timeStr || '17:24:00'} // NC_NET</span>
          </div>

          {/* 24/7 Autonomous Daemon Heartbeat Badge */}
          <div
            className={`px-3 py-1.5 flex items-center gap-2 cyber-cut border ${
              daemonStatus.online
                ? 'bg-[#051A10] border-[#00FF66] text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.25)]'
                : 'bg-[#1F1405] border-[#FCEE0A] text-[#FCEE0A]'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                daemonStatus.online ? 'animate-pulse text-[#00FF66]' : 'text-[#FCEE0A]'
              }`}
            />
            <span className="font-bold text-[11px] tracking-widest">
              {daemonStatus.online ? '24/7 DAEMON: ACTIVE' : 'LOCAL CACHE SYNC'}
            </span>
          </div>

          {/* Bandwidth Consumption */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0D0F18] border border-slate-700/80 cyber-cut">
            <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="text-slate-400 text-[10px]">LOAD:</span>
            <span
              className={`font-bold text-[11px] ${
                bandwidthPercent > 80
                  ? 'text-[#FF003C]'
                  : bandwidthPercent > 50
                  ? 'text-[#FCEE0A]'
                  : 'text-[#00FF66]'
              }`}
            >
              {bandwidthPercent}%
            </span>
          </div>

        </div>

        {/* Right: Audio SFX, Serious vs Meme Toggle, Outbox & Settings */}
        <div className="flex items-center gap-2">
          
          {/* Web Audio Synthesizer Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`p-2 cyber-cut border transition-all ${
              muted
                ? 'bg-[#0D0F18] border-slate-700 text-slate-500'
                : 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
            }`}
            title={muted ? 'Enable Cyberpunk UI Audio SFX' : 'Mute UI Audio SFX'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Serious vs Fun/Meme Mode Toggle (Desktop) */}
          <button
            onClick={handleModeClick}
            className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 text-xs font-cyber font-bold tracking-wider transition-all cyber-cut ${
              uiMode === 'serious'
                ? 'bg-[#00F0FF] text-black hover:bg-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-[#FF003C] text-white hover:bg-pink-400 shadow-[0_0_18px_rgba(255,0,60,0.6)]'
            }`}
          >
            <TechBadge mode={uiMode} type="cat" size="sm" />
            <span>{uiMode === 'serious' ? 'MODE: SERIOUS HUD' : 'MODE: FUN // MEME'}</span>
          </button>

          {/* Outbox Logs */}
          <button
            onClick={() => {
              playCyberClick();
              onOpenOutbox();
            }}
            className="p-2 bg-[#0D0F18] border border-slate-700 text-slate-300 hover:text-[#00F0FF] hover:border-[#00F0FF] cyber-cut transition-all"
            title="View 24/7 Email Outbox Logs"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              playCyberClick();
              onOpenSettings();
            }}
            className="p-2 bg-[#0D0F18] border border-slate-700 text-slate-300 hover:text-[#FCEE0A] hover:border-[#FCEE0A] cyber-cut transition-all"
            title="Configure System & Profile"
          >
            <Sliders className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
