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
  if (radioAudio) {
    radioAudio.muted = muted;
  }
  notifyListeners();
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

// Authentic Night City Cyberpunk 2077 Radio Engine
// Directly streams the real music tracks from cyberpunkredone.webflow.io
export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  description: string;
  title: string;
  artist: string;
  url: string;
  thumbnail: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'morro_rock',
    name: 'MORRO ROCK RADIO',
    frequency: '107.3 MHz',
    genre: 'INDUSTRIAL ROCK / SAMURAI',
    description: 'High-voltage distortion, raw rebellious riffs, and genuine Night City grit.',
    title: 'Johnny Silverhand Theme',
    artist: 'Truemuzic',
    url: 'https://super-macaron-fa8f08.netlify.app/Johnny_Silverhand_Theme.mp3',
    thumbnail: 'https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6672e00f35890ffe05d94fe7_morro.png',
  },
  {
    id: 'body_heat',
    name: 'BODY HEAT RADIO',
    frequency: '98.7 MHz',
    genre: 'SYNTHPOP / NEON BEAT',
    description: 'Smooth infectious neon pop rhythms for cruising through Japantown and Watson.',
    title: 'Really (Voicemail)',
    artist: 'Truemuzic',
    url: 'https://super-macaron-fa8f08.netlify.app/really.mp3',
    thumbnail: 'https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6672e3b6391f56f2fbf94dc2_body%20heat.png',
  },
  {
    id: 'radio_pebkac',
    name: 'RADIO PEBKAC',
    frequency: '103.5 MHz',
    genre: 'DARK TECHNO / NETRUNNER',
    description: 'Driving, dark, pulse-pounding techno rhythms designed for coding and terminal hacking.',
    title: 'Pebkac (Cae Keys)',
    artist: 'Truemuzic',
    url: 'https://super-macaron-fa8f08.netlify.app/pebkac.mp3',
    thumbnail: 'https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6672e66f0df905b9576200a2_pebaks.png',
  },
  {
    id: 'growl_fm',
    name: 'GROWL FM',
    frequency: '89.7 MHz',
    genre: 'UNDERGROUND CYBER ELECTRO',
    description: 'Dogtown pirate airwaves streaming heavy bass and future-electro beats.',
    title: 'Phantom Frequency',
    artist: 'Truemuzic',
    url: 'https://super-macaron-fa8f08.netlify.app/Cp_Growl.mp3',
    thumbnail: 'https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6672e719c0d6b54705b4d24c_growl.png',
  },
  {
    id: 'pacific_dreams',
    name: 'PACIFIC DREAMS',
    frequency: '88.9 MHz',
    genre: 'ATMOSPHERIC CHILLWAVE',
    description: 'Lush neo-noir pads and smooth downtempo keys for deep focus and study sprints.',
    title: 'Ready (Pacific Chill)',
    artist: 'Truemuzic',
    url: 'https://super-macaron-fa8f08.netlify.app/READY.mp3',
    thumbnail: 'https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6671991a1e159a02d5fb0cfd_pacific.png',
  },
];

export interface RadioPlaybackState {
  isPlaying: boolean;
  currentStationId: string;
  currentTime: number;
  duration: number;
  volume: number;
  isBuffering: boolean;
}

let radioAudio: HTMLAudioElement | null = null;
let currentStationId: string = 'pacific_dreams';
let currentVolume: number = 0.8;
const listeners = new Set<(state: RadioPlaybackState) => void>();

function notifyListeners() {
  const state = getRadioState();
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      // Ignore listener error
    }
  });
}

function getRadioAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!radioAudio) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = currentVolume;
    audio.muted = isCyberAudioMuted();

    audio.addEventListener('timeupdate', () => notifyListeners());
    audio.addEventListener('durationchange', () => notifyListeners());
    audio.addEventListener('play', () => notifyListeners());
    audio.addEventListener('pause', () => notifyListeners());
    audio.addEventListener('waiting', () => notifyListeners());
    audio.addEventListener('playing', () => notifyListeners());
    audio.addEventListener('ended', () => {
      playNextRadioStation();
    });
    audio.addEventListener('error', (e) => {
      console.warn('Radio audio error:', e);
      notifyListeners();
    });

    radioAudio = audio;
  }
  return radioAudio;
}

export function getRadioState(): RadioPlaybackState {
  const audio = radioAudio;
  return {
    isPlaying: audio ? !audio.paused && !audio.ended && audio.readyState > 2 : false,
    currentStationId,
    currentTime: audio ? audio.currentTime : 0,
    duration: audio && !isNaN(audio.duration) ? audio.duration : 0,
    volume: currentVolume,
    isBuffering: audio ? audio.readyState < 3 && !audio.paused : false,
  };
}

export function subscribeRadio(listener: (state: RadioPlaybackState) => void): () => void {
  listeners.add(listener);
  listener(getRadioState());
  return () => {
    listeners.delete(listener);
  };
}

export function isRadioPlaying(): boolean {
  return radioAudio ? !radioAudio.paused && !radioAudio.ended : false;
}

export function getCurrentStationId(): string {
  return currentStationId;
}

export function stopCyberRadio() {
  if (radioAudio) {
    try {
      radioAudio.pause();
    } catch {}
  }
  notifyListeners();
}

export function startCyberRadio(stationId: string = currentStationId) {
  const audio = getRadioAudio();
  if (!audio) return;

  playCyberStatic();
  const station = RADIO_STATIONS.find((s) => s.id === stationId) || RADIO_STATIONS[0];
  currentStationId = station.id;

  if (audio.src !== station.url) {
    audio.src = station.url;
    audio.load();
  }

  audio.volume = currentVolume;
  audio.muted = isCyberAudioMuted();
  
  audio.play().catch((err) => {
    console.warn('Browser audio autoplay blocked until interaction:', err);
  });
  notifyListeners();
}

export function toggleRadioPlayback() {
  if (isRadioPlaying()) {
    stopCyberRadio();
  } else {
    startCyberRadio(currentStationId);
  }
}

export function playNextRadioStation() {
  const currentIndex = RADIO_STATIONS.findIndex((s) => s.id === currentStationId);
  const nextIndex = (currentIndex + 1) % RADIO_STATIONS.length;
  startCyberRadio(RADIO_STATIONS[nextIndex].id);
}

export function playPrevRadioStation() {
  const currentIndex = RADIO_STATIONS.findIndex((s) => s.id === currentStationId);
  const prevIndex = (currentIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
  startCyberRadio(RADIO_STATIONS[prevIndex].id);
}

export function setRadioVolume(vol: number) {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (radioAudio) {
    radioAudio.volume = currentVolume;
  }
  notifyListeners();
}

export function seekRadio(time: number) {
  if (radioAudio && !isNaN(time)) {
    radioAudio.currentTime = Math.max(0, Math.min(radioAudio.duration || 0, time));
    notifyListeners();
  }
}

