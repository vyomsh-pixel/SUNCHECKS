// CyberCursor: Custom Cyberpunk Reticle & Target Pointer
// Inspired by cyberpunk2077.webflow.io difference blend reticle

import { useEffect, useState } from 'react';

export function CyberCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only activate for pointer devices with hover capability
    if (window.matchMedia('(pointer: coarse)').matches) return;

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
        target?.closest('[role="button"]')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-difference hidden md:block">
      {/* Reticle Ring */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F0FF] transition-transform duration-75 ease-out"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isHovering ? '44px' : '26px',
          height: isHovering ? '44px' : '26px',
          borderColor: isHovering ? '#FCEE0A' : '#00F0FF',
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.25 : 1})`,
        }}
      >
        {/* Reticle corner ticks */}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-[#00F0FF]" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-[#00F0FF]" />
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-[#00F0FF]" />
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-[#00F0FF]" />
      </div>

      {/* Center Target Dot */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FF003C]"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      />
    </div>
  );
}
