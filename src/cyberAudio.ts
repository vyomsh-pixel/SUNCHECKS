// Web Audio API Synthesizer for Cyberpunk UI
// Pure browser stdlib: zero external audio assets, zero latency, zero 404s.

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setCyberAudioMuted(muted: boolean) {
  isMuted = muted;
  localStorage.setItem('cyber_audio_muted', muted ? 'true' : 'false');
}

export function isCyberAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cyber_audio_muted') === 'true';
}

export function playCyberClick() {
  if (isMuted || isCyberAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio autostart policy
  }
}

export function playCyberGlitch() {
  if (isMuted || isCyberAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.setValueAtTime(850, ctx.currentTime + 0.03);
    osc.frequency.setValueAtTime(240, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  } catch {
    // Ignore
  }
}

export function playCyberAlert() {
  if (isMuted || isCyberAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Two-tone neural chirp
    const osc1 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(1760, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.18);
  } catch {
    // Ignore
  }
}

export function playCyberStatic() {
  if (isMuted || isCyberAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch {
    // Ignore
  }
}

// Procedural Night City Cyberpunk Ambient Radio Engine
export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  description: string;
  baseFreq: number;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'morro_rock',
    name: 'MORRO ROCK RADIO',
    frequency: '98.7 MHz',
    genre: 'INDUSTRIAL DARK SYNTH',
    description: 'High-voltage distortion and raw Night City grit.',
    baseFreq: 110,
  },
  {
    id: 'pacific_dreams',
    name: 'PACIFIC DREAMS',
    frequency: '107.3 MHz',
    genre: 'ATMOSPHERIC CHILLWAVE',
    description: 'Lush neo-noir pads for deep focus and flow state.',
    baseFreq: 146.83,
  },
  {
    id: 'radio_watson',
    name: 'RADIO WATSON',
    frequency: '89.3 MHz',
    genre: 'CYBERPUNK LO-FI BEATS',
    description: 'Warm minor 7th harmonics for daily work sprints.',
    baseFreq: 130.81,
  },
  {
    id: 'royal_blue',
    name: 'ROYAL BLUE NOIR',
    frequency: '91.9 MHz',
    genre: 'NEO-NOIR SUB SYNTH',
    description: 'Deep sub-bass drone and meditative late night frequencies.',
    baseFreq: 98,
  },
];

let activeRadioNodes: {
  oscillators: OscillatorNode[];
  gain: GainNode;
  lfo?: OscillatorNode;
} | null = null;
let currentStationId: string | null = null;

export function isRadioPlaying(): boolean {
  return activeRadioNodes !== null;
}

export function getCurrentStationId(): string | null {
  return currentStationId;
}

export function stopCyberRadio() {
  if (activeRadioNodes) {
    try {
      const now = activeRadioNodes.gain.context.currentTime;
      activeRadioNodes.gain.gain.setValueAtTime(activeRadioNodes.gain.gain.value, now);
      activeRadioNodes.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      setTimeout(() => {
        if (activeRadioNodes) {
          activeRadioNodes.oscillators.forEach((osc) => {
            try { osc.stop(); } catch {}
          });
          if (activeRadioNodes.lfo) {
            try { activeRadioNodes.lfo.stop(); } catch {}
          }
          activeRadioNodes = null;
          currentStationId = null;
        }
      }, 250);
    } catch {
      activeRadioNodes = null;
      currentStationId = null;
    }
  }
}

export function startCyberRadio(stationId: string = 'pacific_dreams') {
  if (isMuted || isCyberAudioMuted()) return;
  stopCyberRadio();
  playCyberStatic();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const station = RADIO_STATIONS.find((s) => s.id === stationId) || RADIO_STATIONS[0];
    currentStationId = station.id;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    // Warm LFO filter sweep
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
    lfoGain.gain.setValueAtTime(350, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Harmonics for a rich Cyberpunk Minor Chord (Root, Minor 3rd, 5th, Minor 7th)
    const root = station.baseFreq;
    const intervals = [1, 1.1892, 1.4983, 1.7818]; // Minor 7th chord ratios
    const oscillators: OscillatorNode[] = [];

    intervals.forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(root * ratio, ctx.currentTime);
      // Slight detune for analog synth chorus warmth
      osc.detune.setValueAtTime((idx - 1.5) * 6, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.25 / intervals.length, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscillators.push(osc);
    });

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    activeRadioNodes = { oscillators, gain: masterGain, lfo };
  } catch (e) {
    console.warn('Radio synth error:', e);
  }
}

