// CyberRadio: Night City Ambient Synth Transceiver
// Inspired directly by cyberpunkredone.webflow.io /radio module
// Generates live procedural ambient synthwave via Web Audio API. Zero external audio files.
// STRICT: No yellow emojis. Clean Lucide vector icons and monospace text badges.

import { useState, useEffect } from 'react';
import { Radio, Play, Square, Volume2, Disc, Activity } from 'lucide-react';
import {
  RADIO_STATIONS,
  startCyberRadio,
  stopCyberRadio,
  isRadioPlaying,
  getCurrentStationId,
  playCyberClick,
  RadioStation,
} from '../cyberAudio';

export function CyberRadio() {
  const [playing, setPlaying] = useState(isRadioPlaying());
  const [selectedStation, setSelectedStation] = useState<RadioStation>(RADIO_STATIONS[1]); // Default Pacific Dreams
  const [trackElapsed, setTrackElapsed] = useState(0);

  useEffect(() => {
    const currentId = getCurrentStationId();
    if (currentId) {
      const match = RADIO_STATIONS.find((s) => s.id === currentId);
      if (match) setSelectedStation(match);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (playing) {
      timer = setInterval(() => {
        setTrackElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [playing]);

  const handleTogglePlay = () => {
    playCyberClick();
    if (playing) {
      stopCyberRadio();
      setPlaying(false);
    } else {
      startCyberRadio(selectedStation.id);
      setPlaying(true);
    }
  };

  const handleSelectStation = (station: RadioStation) => {
    playCyberClick();
    setSelectedStation(station);
    if (playing) {
      startCyberRadio(station.id);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cyber-redone-container p-6 relative">
      {/* Top Corner Hazard Stripe */}
      <div className="absolute top-0 right-0 w-32 h-2.5 hazard-stripe-cyan" />

      {/* Header Readout */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-cyber text-sm font-black tracking-wider uppercase text-white">
              NIGHT CITY SUB-NET // <span className="text-[#00F0FF]">RADIO TRANSCEIVER</span>
            </h2>
            <p className="font-tech text-xs text-slate-400">
              AUDIO CARRIER PROTOCOL // SYNTH-HARMONICS 24/7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 ${playing ? 'bg-[#1CED82] shadow-[0_0_10px_#1CED82]' : 'bg-slate-700'}`} />
          <span className="font-tech text-xs uppercase font-bold text-slate-300">
            {playing ? 'SIGNAL BROADCASTING' : 'CARRIER STANDBY'}
          </span>
        </div>
      </div>

      {/* Main Tuner & Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
        
        {/* Left Column: Station Selector Matrix */}
        <div className="md:col-span-5 space-y-2">
          <div className="font-tech text-xs text-[#FCEE0A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>FREQUENCY SELECTOR [{RADIO_STATIONS.length} CHANNELS]</span>
          </div>

          {RADIO_STATIONS.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <button
                key={station.id}
                onClick={() => handleSelectStation(station)}
                className={`w-full text-left p-2.5 border transition-all flex items-center justify-between cyber-cut ${
                  isSelected
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#0E101A] border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-cyber text-xs font-bold">{station.name}</div>
                  <div className="font-tech text-[10px] text-slate-400">{station.genre}</div>
                </div>
                <div className="text-right">
                  <span className="font-tech text-xs font-bold text-[#FCEE0A]">
                    {station.frequency}
                  </span>
                  {isSelected && playing && (
                    <div className="text-[10px] text-[#1CED82] font-mono">ON AIR</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Equalizer, Barcode & Player Deck */}
        <div className="md:col-span-7 bg-[#07080D] border border-slate-800 p-4 relative flex flex-col justify-between cyber-cut">
          <div>
            {/* Station Status HUD */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div>
                <span className="text-[10px] font-tech text-[#00F0FF] block">ACTIVE TUNING</span>
                <span className="font-cyber text-base font-black text-white">{selectedStation.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-tech text-slate-400 block">FREQUENCY</span>
                <span className="font-tech text-sm font-bold text-[#FCEE0A]">{selectedStation.frequency}</span>
              </div>
            </div>

            <p className="font-hud text-xs text-slate-300 mb-3 italic">
              &quot;{selectedStation.description}&quot;
            </p>

            {/* In-Game Barcode Graphic (cyberpunkredone.webflow.io) */}
            <div className="mb-3">
              <div className="text-[9px] font-tech text-slate-500 mb-1 tracking-widest">
                SIGNAL DATA HASH: 8472-NC-SUB-FM
              </div>
              <div className="img-barcode opacity-75" />
            </div>

            {/* Real-time Dynamic Equalizer Bars */}
            <div className="h-14 bg-[#0A0C14] border border-slate-800/80 px-3 flex items-end justify-between gap-1 mb-4 overflow-hidden">
              {[40, 75, 25, 90, 60, 30, 85, 45, 95, 35, 70, 50, 80, 20, 65, 88].map((baseHeight, idx) => (
                <div
                  key={idx}
                  className={`w-full transition-all duration-150 ${
                    playing
                      ? idx % 2 === 0
                        ? 'bg-[#00F0FF] eq-bar shadow-[0_0_6px_#00F0FF]'
                        : 'bg-[#FCEE0A] eq-bar shadow-[0_0_6px_#FCEE0A]'
                      : 'bg-slate-800 h-1'
                  }`}
                  style={{
                    height: playing ? `${baseHeight}%` : '4px',
                    animationDelay: `${idx * 0.08}s`,
                    animationDuration: `${0.8 + (idx % 4) * 0.25}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className={`px-4 py-2 font-cyber text-xs font-bold uppercase flex items-center gap-2 transition-all cyber-cut ${
                  playing
                    ? 'bg-[#FF003C] hover:bg-[#FF003C]/80 text-white shadow-[0_0_15px_rgba(255,0,60,0.5)]'
                    : 'bg-[#FCEE0A] hover:bg-white text-black shadow-[0_0_15px_rgba(252,238,10,0.5)]'
                }`}
              >
                {playing ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>MUTE CARRIER</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>JACK IN // TUNE IN</span>
                  </>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-slate-400 px-2 py-1 bg-[#121422] border border-slate-800 text-xs font-tech">
                <Disc className={`w-3.5 h-3.5 text-[#00F0FF] ${playing ? 'animate-spin' : ''}`} />
                <span>SYNTH-OS V2.7</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-tech text-xs text-slate-400">
              <Volume2 className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="text-[#1CED82] font-mono">{formatTime(trackElapsed)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Telemetry */}
      <div className="text-[10px] font-tech text-slate-500 border-t border-slate-800/80 pt-2 flex items-center justify-between">
        <span>TRANSMISSION ENCRYPTION: AES-256-GCM // NODE: ARASAKA-TOWER-RELAY</span>
        <span className="text-[#00F0FF]">ZERO BUFFER // BROWSER SYNTH ENGINE</span>
      </div>
    </div>
  );
}
