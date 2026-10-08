// CyberHeader: Authentic Cyberpunk Redone Top Navigation Bar
// Direct inspiration: cyberpunkredone.webflow.io .nav-bar
// Features floating translucent cyber-nav with backdrop-blur, cyan borders,
// intuitive real-world labels in serious mode, playful cyberpunk labels in meme mode,
// cursor mode switcher (cyber crosshair vs default system pointer), wallpaper switcher, and audio controls.

import { useState } from 'react';
import { DaemonStatus, CyberProfile, UiMode } from '../types';
import {
  Volume2,
  VolumeX,
  Terminal,
  Radio,
  Sparkles,
  Server,
  User,
  Image,
  Inbox,
  Crosshair,
  MousePointer,
} from 'lucide-react';
import { WALLPAPERS } from './CyberCityBackdrop';
import { playCyberClick, playCyberGlitch, isCyberAudioMuted, setCyberAudioMuted } from '../cyberAudio';

export type ActiveTab = 'reminders' | 'radio' | 'ideas' | 'daemon' | 'profile';

interface CyberHeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeRemindersCount: number;
  profile: CyberProfile;
  daemonStatus: DaemonStatus;
  uiMode: UiMode;
  currentWallpaperId: string;
  onCycleWallpaper: () => void;
  cursorMode: boolean;
  onToggleCursor: () => void;
  onToggleMode: () => void;
  onOpenOutbox: () => void;
}

export function CyberHeader({
  activeTab,
  onSelectTab,
  activeRemindersCount,
  profile,
  daemonStatus,
  uiMode,
  currentWallpaperId,
  onCycleWallpaper,
  cursorMode,
  onToggleCursor,
  onToggleMode,
  onOpenOutbox,
}: CyberHeaderProps) {
  const [muted, setMuted] = useState(isCyberAudioMuted());

  const handleAudioToggle = () => {
    const next = !muted;
    setMuted(next);
    setCyberAudioMuted(next);
    if (!next) playCyberClick();
  };

  const handleTabClick = (tab: ActiveTab) => {
    playCyberClick();
    onSelectTab(tab);
  };

  const currentWallpaper =
    WALLPAPERS.find((w) => w.id === currentWallpaperId) || WALLPAPERS[0];

  return (
    <header className="sticky top-0 z-50 w-full cyber-redone-nav px-4 py-2.5 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Intuitive Navigation Tabs */}
        <div className="flex items-center gap-6">
          
          {/* Cyberpunk Brand */}
          <div
            onClick={() => handleTabClick('reminders')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 bg-[#FCEE0A] text-black flex items-center justify-center font-black cyber-cut shadow-[0_0_15px_rgba(252,238,10,0.6)]">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-cyber text-sm font-black tracking-widest text-[#FCEE0A] glitch-text uppercase block leading-tight">
                CYBERPULSE
              </span>
              <span className="text-[10px] font-tech text-[#00F0FF] tracking-wider block">
                {uiMode === 'serious' ? `${profile.name.toUpperCase()} // WORK & STUDY SCHEDULE` : '2077 // MEME TERMINAL'}
              </span>
            </div>
          </div>

          {/* Navigation Links (Meaningful in Serious, Playful in Meme) */}
          <nav className="hidden md:flex items-center gap-1 font-hud">
            
            {/* 1. Reminders & Schedule */}
            <button
              onClick={() => handleTabClick('reminders')}
              className={`px-4 py-1.5 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold transition-all cyber-cut ${
                activeTab === 'reminders'
                  ? 'bg-[#00F0FF]/20 border-b-2 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-[#29ffff] hover:text-white hover:bg-white/5'
              }`}
            >
              <img
                src="https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6670514917ee0da841f1ccdf_1_95X6TEleBudY1EpDWnXgMQ.png"
                alt="Tasks"
                className="w-4 h-4 object-contain"
              />
              <span>{uiMode === 'serious' ? 'REMINDERS & SCHEDULE' : 'CORPO GIGS'}</span>
              {activeRemindersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FCEE0A] text-black text-[11px] font-bold font-mono">
                  {activeRemindersCount}
                </span>
              )}
            </button>

            {/* 2. Certifications & Projects */}
            <button
              onClick={() => handleTabClick('ideas')}
              className={`px-4 py-1.5 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold transition-all cyber-cut ${
                activeTab === 'ideas'
                  ? 'bg-[#00F0FF]/20 border-b-2 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-[#29ffff] hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#FCEE0A]" />
              <span>{uiMode === 'serious' ? 'CERTS & PROJECTS' : 'HUSTLE & SHARDS'}</span>
            </button>

            {/* 3. 24/7 Email Automation */}
            <button
              onClick={() => handleTabClick('daemon')}
              className={`px-4 py-1.5 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold transition-all cyber-cut ${
                activeTab === 'daemon'
                  ? 'bg-[#00F0FF]/20 border-b-2 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-[#29ffff] hover:text-white hover:bg-white/5'
              }`}
            >
              <Server className="w-4 h-4 text-[#00FF66]" />
              <span>{uiMode === 'serious' ? 'EMAIL AUTOMATION' : 'SPAM CANNON 24/7'}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  daemonStatus.online ? 'bg-[#00FF66] animate-pulse' : 'bg-slate-500'
                }`}
              />
            </button>

            {/* 4. Workload & Profile */}
            <button
              onClick={() => handleTabClick('profile')}
              className={`px-4 py-1.5 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold transition-all cyber-cut ${
                activeTab === 'profile'
                  ? 'bg-[#00F0FF]/20 border-b-2 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-[#29ffff] hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4 text-slate-300" />
              <span>{uiMode === 'serious' ? 'MY WORKLOAD' : 'BURNOUT METER'}</span>
            </button>

            {/* 5. Focus Radio (Last Section) */}
            <button
              onClick={() => handleTabClick('radio')}
              className={`px-4 py-1.5 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold transition-all cyber-cut ${
                activeTab === 'radio'
                  ? 'bg-[#00F0FF]/20 border-b-2 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-[#29ffff] hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4 text-[#00F0FF]" />
              <span>{uiMode === 'serious' ? 'FOCUS RADIO' : 'CHILLWAVE FREQ'}</span>
            </button>
          </nav>

        </div>

        {/* Right Tools: Cursor Mode Toggle, Wallpaper Switcher, Outbox, Audio, and Mode */}
        <div className="flex items-center gap-2">
          
          {/* Cursor Mode Switcher: Fixes Dual-Cursor Issue with 1-Click Toggle */}
          <button
            onClick={() => {
              playCyberClick();
              onToggleCursor();
            }}
            className={`px-2.5 py-1.5 cyber-cut border text-xs font-tech flex items-center gap-1.5 transition-all ${
              cursorMode
                ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-[#0A0D16]/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
            title={cursorMode ? 'Cyber Reticle Active (Click to use default system pointer)' : 'Default Pointer Active (Click to use Cyber Reticle)'}
          >
            {cursorMode ? <Crosshair className="w-3.5 h-3.5 text-[#00F0FF]" /> : <MousePointer className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden lg:inline text-[11px] font-bold">
              {cursorMode ? 'CYBER CURSOR' : 'DEFAULT POINTER'}
            </span>
          </button>

          {/* Wallpaper Switcher Button */}
          <button
            onClick={onCycleWallpaper}
            className="px-2.5 py-1.5 bg-[#0A0D16]/80 hover:bg-[#00F0FF]/15 border border-[#00F0FF]/50 text-[#00F0FF] hover:border-[#00F0FF] cyber-cut text-xs font-tech flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            title={`Active: ${currentWallpaper.name}. Click to change background wallpaper.`}
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">WALLPAPER</span>
            <span className="text-[10px] text-[#FCEE0A] font-mono hidden xl:inline">
              [{currentWallpaper.name.split(' ')[0]}]
            </span>
          </button>

          {/* Outbox Logs */}
          <button
            onClick={() => {
              playCyberClick();
              onOpenOutbox();
            }}
            className="p-2 bg-[#0A0D16]/80 hover:bg-[#FCEE0A]/15 border border-slate-700 hover:border-[#FCEE0A] text-slate-300 hover:text-[#FCEE0A] cyber-cut text-xs transition-all"
            title="Inspect 24/7 Email Outbox History"
          >
            <Inbox className="w-4 h-4" />
          </button>

          {/* Web Audio Mute Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`p-2 cyber-cut border transition-all ${
              muted
                ? 'bg-[#0D0F18]/80 border-slate-800 text-slate-500'
                : 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
            }`}
            title={muted ? 'Enable UI Audio SFX' : 'Mute UI Audio SFX'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Serious vs Fun/Meme Mode Switcher */}
          <button
            onClick={() => {
              playCyberGlitch();
              onToggleMode();
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-cyber font-bold tracking-wider cyber-cut transition-all ${
              uiMode === 'serious'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-[#FF003C] text-white shadow-[0_0_12px_rgba(255,0,60,0.5)]'
            }`}
            title="Switch between Serious Productive HUD and Humorous Cyberpunk Meme mode"
          >
            <span>{uiMode === 'serious' ? 'SERIOUS MODE' : 'MEME MODE'}</span>
          </button>

        </div>

      </div>

      {/* Mobile Nav Tabs */}
      <div className="flex md:hidden items-center justify-around gap-1 pt-2 border-t border-slate-800/80 mt-2 font-hud text-xs">
        <button
          onClick={() => handleTabClick('reminders')}
          className={`px-2 py-1 ${activeTab === 'reminders' ? 'text-[#00F0FF] font-bold' : 'text-slate-400'}`}
        >
          {uiMode === 'serious' ? 'REMINDERS' : 'GIGS'}
        </button>
        <button
          onClick={() => handleTabClick('ideas')}
          className={`px-2 py-1 ${activeTab === 'ideas' ? 'text-[#00F0FF] font-bold' : 'text-slate-400'}`}
        >
          {uiMode === 'serious' ? 'PROJECTS' : 'SHARDS'}
        </button>
        <button
          onClick={() => handleTabClick('daemon')}
          className={`px-2 py-1 ${activeTab === 'daemon' ? 'text-[#00F0FF] font-bold' : 'text-slate-400'}`}
        >
          {uiMode === 'serious' ? 'EMAIL' : 'SPAM'}
        </button>
        <button
          onClick={() => handleTabClick('profile')}
          className={`px-2 py-1 ${activeTab === 'profile' ? 'text-[#00F0FF] font-bold' : 'text-slate-400'}`}
        >
          {uiMode === 'serious' ? 'WORKLOAD' : 'BURNOUT'}
        </button>
        <button
          onClick={() => handleTabClick('radio')}
          className={`px-2 py-1 ${activeTab === 'radio' ? 'text-[#00F0FF] font-bold' : 'text-slate-400'}`}
        >
          {uiMode === 'serious' ? 'RADIO' : 'CHILL'}
        </button>
      </div>
    </header>
  );
}
