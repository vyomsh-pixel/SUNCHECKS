// CyberVideoBtn: High-Impact Video-Background Button
// Inspired by video-bg-button.webflow.io
// Features a dynamic looping cyberpunk cyber-mesh canvas masked inside a 45° chamfered container.
// STRICT: No emojis. Vector icons and monospace typography.

import React from 'react';
import { playCyberClick } from '../cyberAudio';

interface CyberVideoBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'yellow' | 'cyan' | 'red';
  icon?: React.ReactNode;
  subtitle?: string;
}

export function CyberVideoBtn({
  children,
  variant = 'yellow',
  icon,
  subtitle,
  className = '',
  onClick,
  ...props
}: CyberVideoBtnProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playCyberClick();
    if (onClick) onClick(e);
  };

  const accentColor =
    variant === 'cyan' ? '#00F0FF' : variant === 'red' ? '#FF003C' : '#FCEE0A';

  return (
    <button
      onClick={handleClick}
      style={{ borderColor: accentColor }}
      className={`cyber-video-btn px-5 py-3 group relative cursor-pointer font-cyber text-xs uppercase font-extrabold tracking-wider text-white shadow-[0_0_20px_rgba(252,238,10,0.2)] ${className}`}
      {...props}
    >
      {/* Corner bracket accent */}
      <span
        className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 z-10"
        style={{ borderColor: accentColor }}
      />
      <span
        className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 z-10"
        style={{ borderColor: accentColor }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2.5">
        {icon && <span className="text-[#FCEE0A] group-hover:scale-110 transition-transform">{icon}</span>}
        <span className="flex flex-col text-left">
          <span className="group-hover:text-[#FCEE0A] transition-colors">{children}</span>
          {subtitle && (
            <span className="font-tech text-[9px] text-slate-400 tracking-normal normal-case">
              {subtitle}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
