// CyberRadio: Authentic Night City 2077 Radio Transceiver
// Direct parity with cyberpunkredone.webflow.io /radio
// Streams genuine Cyberpunk music tracks: Morro Rock, Body Heat, Radio Pebkac, Growl FM, Pacific Dreams.
// STRICT: Zero yellow emojis. High-contrast typography and authentic HUD visuals.

import { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc,
  Activity,
  Music2,
} from 'lucide-react';
import {
  RADIO_STATIONS,
  RadioStation,
  RadioPlaybackState,
  subscribeRadio,
  startCyberRadio,
  toggleRadioPlayback,
  playNextRadioStation,
  playPrevRadioStation,
  setRadioVolume,
  seekRadio,
  playCyberClick,
} from '../cyberAudio';

export function CyberRadio() {
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

  const activeStation: RadioStation =
    RADIO_STATIONS.find((s) => s.id === playbackState.currentStationId) || RADIO_STATIONS[0];

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectStation = (station: RadioStation) => {
    playCyberClick();
    startCyberRadio(station.id);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playbackState.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekRadio(pos * playbackState.duration);
  };

  const progressPercent = playbackState.duration
    ? Math.min(100, Math.max(0, (playbackState.currentTime / playbackState.duration) * 100))
    : 0;

  return (
    <div className="w-full space-y-6">
      <div className="cyber-redone-container p-4 sm:p-7 relative min-h-[580px] flex flex-col justify-between">
        {/* Top Hazard Stripe */}
        <div className="absolute top-0 right-0 w-36 h-2.5 hazard-stripe-cyan" />

        {/* Header HUD Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#00F0FF]/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00F0FF]/15 border border-[#00F0FF] flex items-center justify-center text-[#00F0FF] cyber-cut shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-tech text-[#00F0FF] tracking-widest uppercase">
                TRN_TCLAS_B00095 // NIGHT CITY AIRWAVES
              </div>
              <h2 className="font-cyber text-xl font-black tracking-wider uppercase text-white flex items-center gap-2">
                <span>NIGHT CITY RADIO</span>
                <span className="text-[#FCEE0A] text-sm font-mono">
                  [{activeStation.frequency}]
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 font-tech text-xs">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#05070D]/80 border border-slate-700 cyber-cut">
              <span
                className={`w-2 h-2 rounded-full ${
                  playbackState.isPlaying
                    ? 'bg-[#1CED82] shadow-[0_0_8px_#1CED82] animate-ping'
                    : 'bg-slate-600'
                }`}
              />
              <span className="font-bold text-slate-200">
                {playbackState.isPlaying
                  ? 'ON AIR // BROADCAST LIVE'
                  : playbackState.isBuffering
                  ? 'SYNCHRONIZING STREAM...'
                  : 'CARRIER STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: Station Selector (Left) & Deck / Artwork (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          
          {/* Left Column: Stations List */}
          <div className="lg:col-span-5 space-y-2.5 flex flex-col justify-start">
            <div className="text-xs font-tech text-[#FCEE0A] tracking-wider uppercase flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <Activity className="w-4 h-4 text-[#FCEE0A]" />
                FREQUENCY CHANNELS [{RADIO_STATIONS.length}]
              </span>
              <span className="text-slate-400 text-[11px]">AUTHENTIC AUDIO</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
              {RADIO_STATIONS.map((station) => {
                const isSelected = activeStation.id === station.id;
                const isThisPlaying = isSelected && playbackState.isPlaying;

                return (
                  <button
                    key={station.id}
                    onClick={() => handleSelectStation(station)}
                    className={`w-full text-left p-3.5 transition-all flex items-center justify-between gap-3 cyber-cut border ${
                      isSelected
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        : 'bg-[#090C16]/80 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={station.thumbnail}
                        alt={station.name}
                        className="w-10 h-10 object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="font-cyber text-xs font-bold truncate text-white">
                          {station.name}
                        </div>
                        <div className="font-hud text-xs text-slate-300 truncate">
                          {station.title}
                        </div>
                        <div className="font-tech text-[10px] text-[#00F0FF] uppercase tracking-wider">
                          {station.genre}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-tech text-xs font-black text-[#FCEE0A] block">
                        {station.frequency}
                      </span>
                      {isThisPlaying ? (
                        <span className="inline-block px-1.5 py-0.5 bg-[#1CED82] text-black text-[9px] font-black font-mono cyber-cut">
                          LIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-tech text-slate-500">TUNE</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Deck, Album Art & Full Controls */}
          <div className="lg:col-span-7 bg-[#05070D]/90 border border-[#00F0FF]/40 p-6 cyber-cut flex flex-col justify-between shadow-[0_0_25px_rgba(0,240,255,0.15)] relative">
            <div>
              {/* Active Station Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={activeStation.thumbnail}
                    alt={activeStation.name}
                    className="w-16 h-16 object-cover border-2 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  />
                  <div>
                    <span className="text-[10px] font-tech text-[#00F0FF] tracking-widest uppercase block">
                      CURRENTLY BROADCASTING
                    </span>
                    <h3 className="font-cyber text-lg font-black text-white leading-tight">
                      {activeStation.name}
                    </h3>
                    <div className="font-hud text-sm text-[#FCEE0A] font-semibold flex items-center gap-2">
                      <Music2 className="w-3.5 h-3.5" />
                      <span>{activeStation.title}</span>
                      <span className="text-slate-400 text-xs">({activeStation.artist})</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-tech text-slate-400 uppercase block">FREQ</span>
                  <span className="font-tech text-base font-bold text-[#FCEE0A]">
                    {activeStation.frequency}
                  </span>
                </div>
              </div>

              {/* Station Description */}
              <p className="font-hud text-sm text-slate-300 mb-4 italic leading-relaxed">
                &quot;{activeStation.description}&quot;
              </p>

              {/* Barcode Element (from cyberpunkredone.webflow.io) */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[9px] font-tech text-slate-500 mb-1 tracking-widest">
                  <span>SIGNAL STREAM: {activeStation.id.toUpperCase()}_AUDIO_TRK</span>
                  <span>AES-256 STEREO 320KBPS</span>
                </div>
                <div className="img-barcode opacity-85" />
              </div>

              {/* Real-Time Equalizer Visualizer */}
              <div className="h-14 bg-[#0A0D18] border border-slate-800 px-3 flex items-end justify-between gap-1 mb-4 overflow-hidden">
                {[45, 80, 30, 95, 65, 35, 90, 50, 100, 40, 75, 55, 85, 25, 70, 92, 48, 82, 38, 90].map(
                  (baseHeight, idx) => (
                    <div
                      key={idx}
                      className={`w-full transition-all duration-150 ${
                        playbackState.isPlaying
                          ? idx % 2 === 0
                            ? 'bg-[#00F0FF] eq-bar shadow-[0_0_6px_#00F0FF]'
                            : 'bg-[#FCEE0A] eq-bar shadow-[0_0_6px_#FCEE0A]'
                          : 'bg-slate-800 h-1'
                      }`}
                      style={{
                        height: playbackState.isPlaying ? `${baseHeight}%` : '4px',
                        animationDelay: `${idx * 0.06}s`,
                        animationDuration: `${0.7 + (idx % 4) * 0.2}s`,
                      }}
                    />
                  )
                )}
              </div>

              {/* Seekable Progress Bar */}
              <div className="space-y-1.5 mb-5">
                <div
                  onClick={handleSeek}
                  className="w-full h-2.5 bg-[#0C101E] border border-slate-700 cursor-pointer relative group"
                  title="Click to seek track"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FCEE0A] transition-all relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-3.5 bg-white border border-black shadow-[0_0_6px_white]" />
                  </div>
                </div>

                <div className="flex items-center justify-between font-tech text-xs text-slate-400">
                  <span>{formatTime(playbackState.currentTime)}</span>
                  <span className="text-[#00F0FF] text-[10px] tracking-wider">
                    {playbackState.isPlaying ? 'STEREO BROADCASTING' : 'READY'}
                  </span>
                  <span>{formatTime(playbackState.duration)}</span>
                </div>
              </div>
            </div>

            {/* Deck Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              
              {/* Playback Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    playCyberClick();
                    playPrevRadioStation();
                  }}
                  className="p-2.5 bg-[#0A0D16] border border-slate-700 hover:border-[#00F0FF] hover:text-[#00F0FF] text-slate-300 cyber-cut transition-all"
                  title="Previous Station"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    playCyberClick();
                    toggleRadioPlayback();
                  }}
                  className={`px-6 py-2.5 font-cyber text-xs font-black uppercase flex items-center gap-2 transition-all cyber-cut ${
                    playbackState.isPlaying
                      ? 'bg-[#FF003C] hover:bg-[#FF003C]/90 text-white shadow-[0_0_20px_rgba(255,0,60,0.6)]'
                      : 'bg-[#FCEE0A] hover:bg-white text-black shadow-[0_0_20px_rgba(252,238,10,0.6)]'
                  }`}
                >
                  {playbackState.isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>PAUSE RADIO</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>TUNE IN // PLAY</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    playCyberClick();
                    playNextRadioStation();
                  }}
                  className="p-2.5 bg-[#0A0D16] border border-slate-700 hover:border-[#00F0FF] hover:text-[#00F0FF] text-slate-300 cyber-cut transition-all"
                  title="Next Station"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2.5 font-tech text-xs text-slate-300">
                <button
                  onClick={() => {
                    playCyberClick();
                    setRadioVolume(playbackState.volume === 0 ? 0.8 : 0);
                  }}
                  className="p-1 hover:text-[#00F0FF] transition-colors"
                  title={playbackState.volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {playbackState.volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#00F0FF]" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={playbackState.volume}
                  onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
                  className="w-24 accent-[#00F0FF] cursor-pointer"
                />
                <span className="w-8 text-right font-mono text-slate-400">
                  {Math.round(playbackState.volume * 100)}%
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Sub-Net Readout */}
        <div className="mt-6 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-tech text-slate-500">
          <div className="flex items-center gap-2">
            <Disc className={`w-3.5 h-3.5 text-[#00F0FF] ${playbackState.isPlaying ? 'animate-spin' : ''}`} />
            <span>NIGHT CITY AUDIO MATRIX // NETLIFY RELAY V4.1</span>
          </div>
          <span>ZERO LATENCY STREAMING // RUNS SEAMLESSLY IN BACKGROUND ACROSS ALL TABS</span>
        </div>

      </div>
    </div>
  );
}
