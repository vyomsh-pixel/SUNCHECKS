// TechBadge / MemeAvatar component
// STRICT RULE: No yellow emojis. Clean SVG circular meme/tech avatars and text badges only.

import { UiMode } from '../types';

interface TechBadgeProps {
  type?: 'cat' | 'dog' | 'dev' | 'bot' | 'terminal';
  mode: UiMode;
  size?: 'sm' | 'md' | 'lg';
}

export function TechBadge({ type = 'dev', mode, size = 'sm' }: TechBadgeProps) {
  const dim = size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10';

  if (mode === 'serious') {
    return (
      <div
        className={`${dim} rounded-full bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]`}
        title="Tactical HUD Node"
      >
        SYS
      </div>
    );
  }

  // Fun / Meme Mode: Circular mini-avatars (cat, doge, dev, bot)
  switch (type) {
    case 'cat':
      return (
        <div
          className={`${dim} rounded-full bg-pink-950/80 border border-pink-500/60 overflow-hidden flex items-center justify-center shadow-[0_0_8px_rgba(255,0,85,0.4)]`}
          title="Hacker Cat Meme Node"
        >
          <svg viewBox="0 0 36 36" className="w-full h-full fill-current text-pink-400">
            {/* Minimalist sunglasses cat meme */}
            <path d="M7 11L11 3L18 8L25 3L29 11C31 16 30 25 18 31C6 25 5 16 7 11Z" fill="#3B0764" />
            <path d="M8 17H28V22H8V17Z" fill="#00F0FF" />
            <rect x="9" y="18" width="8" height="3" fill="#000" />
            <rect x="19" y="18" width="8" height="3" fill="#000" />
            <path d="M16 26L18 28L20 26" stroke="#FF0055" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'dog':
      return (
        <div
          className={`${dim} rounded-full bg-amber-950/80 border border-amber-400/60 overflow-hidden flex items-center justify-center shadow-[0_0_8px_rgba(255,184,0,0.4)]`}
          title="Shiba Cyber Meme Node"
        >
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <circle cx="18" cy="18" r="16" fill="#78350F" />
            <polygon points="8,10 14,4 16,14" fill="#D97706" />
            <polygon points="28,10 22,4 20,14" fill="#D97706" />
            <circle cx="13" cy="18" r="2.5" fill="#000" />
            <circle cx="23" cy="18" r="2.5" fill="#000" />
            <polygon points="16,22 20,22 18,25" fill="#1C1917" />
          </svg>
        </div>
      );

    case 'bot':
      return (
        <div
          className={`${dim} rounded-full bg-emerald-950/80 border border-emerald-400/60 overflow-hidden flex items-center justify-center shadow-[0_0_8px_rgba(0,255,102,0.4)]`}
          title="Sarcastic Bot Node"
        >
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <rect x="8" y="10" width="20" height="18" rx="4" fill="#064E3B" stroke="#00FF66" strokeWidth="2" />
            <rect x="12" y="15" width="4" height="4" fill="#00FF66" />
            <rect x="20" y="15" width="4" height="4" fill="#00FF66" />
            <line x1="13" y1="23" x2="23" y2="23" stroke="#00FF66" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    default: // 'dev'
      return (
        <div
          className={`${dim} rounded-full bg-cyan-950/80 border border-cyan-400/60 overflow-hidden flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.4)]`}
          title="Gigachad Dev Meme Node"
        >
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <circle cx="18" cy="18" r="16" fill="#082F49" />
            <path d="M12 14C12 11 24 11 24 14" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="14" cy="17" r="2" fill="#00F0FF" />
            <circle cx="22" cy="17" r="2" fill="#00F0FF" />
            <path d="M14 24Q18 28 22 24" stroke="#FF0055" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );
  }
}
