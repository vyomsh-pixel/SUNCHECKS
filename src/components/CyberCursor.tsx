// CyberCursor: Custom Cyberpunk Crosshair Reticle
// Eliminates the dual-cursor issue by strictly applying cursor: none to the DOM when active.
// Can be completely toggled off in favor of the standard OS mouse pointer.

import { useEffect, useState } from 'react';

interface CyberCursorProps {
  enabled?: boolean;
}

export function CyberCursor({ enabled = true }: CyberCursorProps) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('hide-os-cursor');
      return;
    }

    // Only activate for mouse/pointer devices (not mobile touch screens)
    if (window.matchMedia('(pointer: coarse)').matches) {
      document.body.classList.remove('hide-os-cursor');
      return;
    }

    // Hide system pointer completely
    document.body.classList.add('hide-os-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('button') ||
        target?.closest('a') ||
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('select') ||
        target?.closest('[role="button"]')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('hide-os-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [enabled, isVisible]);

  if (!enabled || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden mix-blend-difference hidden md:block">
      {/* Outer Reticle Ring */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F0FF] transition-all duration-75 ease-out"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isHovering ? '42px' : '24px',
          height: isHovering ? '42px' : '24px',
          borderColor: isHovering ? '#FCEE0A' : '#00F0FF',
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.2 : 1})`,
        }}
      >
        {/* Reticle tick marks */}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-[#00F0FF]" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-[#00F0FF]" />
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-[#00F0FF]" />
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-[#00F0FF]" />
      </div>

      {/* Center Target Dot */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FF003C] rounded-full"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      />
    </div>
  );
}
