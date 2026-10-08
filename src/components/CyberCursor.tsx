// CyberCursor: High-Performance Hardware-Accelerated Cyberpunk Reticle
// Engineered for low-spec & 8GB RAM setups:
// 1. Zero React re-renders on mousemove (direct DOM transform: translate3d).
// 2. All reticle components (center dot, crosshairs, corner brackets) are locked into ONE rigid container.
// 3. Zero positional lag or separation: hardware 1:1 mouse tracking with zero jitter.
// 4. Smooth micro-scale lock on interactive targets (buttons, links, inputs).

import { useEffect, useRef } from 'react';

interface CyberCursorProps {
  enabled?: boolean;
}

export function CyberCursor({ enabled = true }: CyberCursorProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('hide-os-cursor');
      return;
    }

    // Touch devices use native tap gestures; skip custom cursor
    if (window.matchMedia('(pointer: coarse)').matches) {
      document.body.classList.remove('hide-os-cursor');
      return;
    }

    // Hide OS default pointer
    document.body.classList.add('hide-os-cursor');

    const cursorEl = cursorRef.current;
    const ringEl = ringRef.current;
    if (!cursorEl) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Direct GPU transform update: 0 React state updates, 0 re-renders
      cursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        cursorEl.style.opacity = '1';
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest(
        'button, a, input, textarea, select, [role="button"], label, .clickable, .cursor-pointer'
      );

      if (ringEl) {
        if (isInteractive) {
          ringEl.classList.add('cyber-cursor-locked');
        } else {
          ringEl.classList.remove('cyber-cursor-locked');
        }
      }
    };

    const handleMouseDown = () => {
      if (ringEl) ringEl.classList.add('cyber-cursor-click');
    };

    const handleMouseUp = () => {
      if (ringEl) ringEl.classList.remove('cyber-cursor-click');
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      cursorEl.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      cursorEl.style.opacity = '1';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('hide-os-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[999999] will-change-transform opacity-0 select-none hidden md:block"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
        transition: 'opacity 0.15s ease-out',
      }}
    >
      {/* 
        Single Unified Reticle Assembly:
        Centered exactly at (0, 0) of the parent coordinate space.
        All elements (brackets, crosshair lines, center dot) move together synchronously.
      */}
      <div
        ref={ringRef}
        className="cyber-cursor-assembly relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
      >
        {/* Outer Angled Corner Brackets (Unified Box) */}
        <div className="cyber-cursor-box w-6 h-6 relative transition-transform duration-150 ease-out">
          {/* Top-Left Corner */}
          <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#00F0FF]" />
          {/* Top-Right Corner */}
          <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#00F0FF]" />
          {/* Bottom-Left Corner */}
          <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#00F0FF]" />
          {/* Bottom-Right Corner */}
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#00F0FF]" />

          {/* Micro Crosshair Axis Ticks */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-[1px] bg-[#00F0FF]/80" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-[1px] bg-[#00F0FF]/80" />
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-1 bg-[#00F0FF]/80" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-1 bg-[#00F0FF]/80" />
        </div>

        {/* Center Target Dot (Crimson Red / Neon Yellow on Hover) */}
        <div className="cyber-cursor-dot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FF003C] shadow-[0_0_6px_#FF003C]" />
      </div>
    </div>
  );
}
