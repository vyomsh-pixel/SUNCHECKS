// CyberRadioDock: Persistent Night City Audio Player Bar
// Positioned at the bottom section across all operational tabs.
// Plays continuous Cyberpunk 2077 music while the user tracks tasks, certifications, and emails.
// STRICT: Zero yellow emojis. Crisp HUD typography.

import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Radio,
  Volume2,
  VolumeX,
  ExternalLink,
} from 'lucide-react';
import {
  RADIO_STATIONS,
  RadioPlaybackState,
  subscribeRadio,
  toggleRadioPlayback,
  playNextRadioStation,
  playPrevRadioStation,
  setRadioVolume,
  playCyberClick,
} from '../cyberAudio';

interface CyberRadioDockProps {
  onOpenRadioTab: () => void;
  isRadioTabActive: boolean;
}

export function CyberRadioDock({ onOpenRadioTab, isRadioTabActive }: CyberRadioDockProps) {
  const [playbackState, setPlaybackState] = useState<RadioPlaybackState>({
    isPlaying: false,
    currentStationId: 'morro_rock',
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isBuffering: false,
  });

  useEffect(() => {
    const unsubscribe = subscribeRadio(setPlaybackState);
    return () => unsubscribe();
  }, []);

  const activeStation =
    RADIO_STATIONS.find((s) => s.id === playbackState.currentStationId) || RADIO_STATIONS[0];

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = playbackState.duration
    ? Math.min(100, Math.max(0, (playbackState.currentTime / playbackState.duration) * 100))
    : 0;

  // If the user is already on the dedicated full radio tab, don't duplicate the dock
  if (isRadioTabActive) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6 mb-2 z-20">
      <div className="cyber-redone-container p-3 sm:p-4 border border-[#00F0FF]/40 shadow-[0_4px_25px_rgba(0,0,0,0.8)] relative">
        {/* Top cyan accent line */}
        <div className="absolute top-0 left-0 w-24 h-1 bg-[#00F0FF]" />
        
        {/* Real-time progress sliver */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#121624]">
          <div
            className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FCEE0A] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-hud">
          
          {/* Left: Station & Track Info */}
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
            <div className="relative flex-shrink-0">
              <img
                src={activeStation.thumbnail}
                alt={activeStation.name}
                className="w-11 h-11 object-cover border border-[#00F0FF]/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
              />
              {playbackState.isPlaying && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1CED82] rounded-full border border-black shadow-[0_0_6px_#1CED82]" />
              )}
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-cyber text-[#00F0FF] font-bold uppercase tracking-wider">
                  RADIO // {activeStation.frequency}
                </span>
                <span className="text-[9px] font-tech text-[#FCEE0A] px-1 py-0.2 bg-[#FCEE0A]/10 border border-[#FCEE0A]/30">
                  {playbackState.isPlaying ? 'BROADCASTING' : 'STANDBY'}
                </span>
              </div>
              <h4 className="font-hud text-sm font-bold text-white truncate leading-tight">
                {activeStation.name}
              </h4>
              <p className="font-tech text-xs text-slate-300 truncate">
                {activeStation.title} &bull; <span className="text-slate-400">{activeStation.artist}</span>
              </p>
            </div>
          </div>

          {/* Center: Live Equalizer Bars */}
          <div className="hidden md:flex items-end gap-1 h-7 px-4">
            {[30, 80, 50, 95, 40, 70, 85, 45, 60, 90, 35, 75].map((height, i) => (
              <div
                key={i}
                className={`w-1 transition-all duration-150 ${
                  playbackState.isPlaying
                    ? i % 2 === 0
                      ? 'bg-[#00F0FF] eq-bar'
                      : 'bg-[#FCEE0A] eq-bar'
                    : 'bg-slate-700 h-1'
                }`}
                style={{
                  height: playbackState.isPlaying ? `${height}%` : '3px',
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* Right: Controls & Jump Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playCyberClick();
                  playPrevRadioStation();
                }}
                className="p-1.5 bg-[#080B14] border border-slate-700 hover:border-[#00F0FF] hover:text-[#00F0FF] text-slate-300 cyber-cut transition-colors"
                title="Previous Station"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  playCyberClick();
                  toggleRadioPlayback();
                }}
                className={`px-3.5 py-1.5 font-cyber text-xs font-black uppercase flex items-center gap-1.5 cyber-cut transition-all ${
                  playbackState.isPlaying
                    ? 'bg-[#FF003C] hover:bg-[#FF003C]/90 text-white shadow-[0_0_12px_rgba(255,0,60,0.5)]'
                    : 'bg-[#FCEE0A] hover:bg-white text-black shadow-[0_0_12px_rgba(252,238,10,0.5)]'
                }`}
              >
                {playbackState.isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY RADIO</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  playCyberClick();
                  playNextRadioStation();
                }}
                className="p-1.5 bg-[#080B14] border border-slate-700 hover:border-[#00F0FF] hover:text-[#00F0FF] text-slate-300 cyber-cut transition-colors"
                title="Next Station"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Elapsed Time Readout */}
            <div className="hidden lg:block font-tech text-xs text-slate-400">
              <span className="text-[#1CED82] font-mono">{formatTime(playbackState.currentTime)}</span>
              <span className="text-slate-600"> / </span>
              <span>{formatTime(playbackState.duration)}</span>
            </div>

            {/* Volume Toggle */}
            <button
              onClick={() => {
                playCyberClick();
                setRadioVolume(playbackState.volume === 0 ? 0.8 : 0);
              }}
              className="p-1.5 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white"
              title={playbackState.volume === 0 ? 'Unmute' : 'Mute'}
            >
              {playbackState.volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#00F0FF]" />
              )}
            </button>

            {/* Jump to Full Radio Station Tab */}
            <button
              onClick={() => {
                playCyberClick();
                onOpenRadioTab();
              }}
              className="px-2.5 py-1.5 bg-[#00F0FF]/15 border border-[#00F0FF]/50 hover:border-[#00F0FF] text-[#00F0FF] cyber-cut text-xs font-tech flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(0,240,255,0.2)]"
              title="Open full Night City radio station tuner"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">FULL RADIO</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
