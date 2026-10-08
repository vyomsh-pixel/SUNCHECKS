// CyberCityBackdrop: Authentic High-Resolution Night City Wallpaper & Atmosphere Engine
// Directly uses the high-res 2.36MB Night City wallpapers from cyberpunkredone.webflow.io
// Features customizable wallpaper selection and subtle non-intrusive cyber rain & holographic glints.
// STRICT: The wallpaper remains 100% visible and vivid behind semi-transparent cyber glass.

import { useState, useEffect, useRef } from 'react';

export interface WallpaperOption {
  id: string;
  name: string;
  url: string;
  theme: string;
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: 'cyberpunk_redone_dark',
    name: 'NIGHT CITY TERMINAL (REDONE)',
    url: 'https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6673f9960c7892e205b6b78a_walldarker.png',
    theme: 'Dark In-Game Terminal',
  },
  {
    id: 'cyberpunk_redone_neon',
    name: 'NEON GRID HIGHWAY',
    url: 'https://cdn.prod.website-files.com/666af2245cb6e7d54094d64f/6671516d592ab06eb6a2855d_Group%20125.png',
    theme: 'Atmospheric Turquoise & Purple',
  },
  {
    id: 'rainy_megapolis',
    name: 'RAINY MEGAPOLIS 4K',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    theme: 'Neon Rain & Highrises',
  },
  {
    id: 'arasaka_midnight',
    name: 'ARASAKA WATERFRONT',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2070&auto=format&fit=crop',
    theme: 'Deep Cyan & Electric Blue',
  },
];

interface CyberCityBackdropProps {
  currentWallpaperId?: string;
}

export function CyberCityBackdrop({ currentWallpaperId }: CyberCityBackdropProps) {
  const [activeWallpaper, setActiveWallpaper] = useState<WallpaperOption>(WALLPAPERS[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const savedId = currentWallpaperId || localStorage.getItem('cyber_wallpaper_id');
    if (savedId) {
      const match = WALLPAPERS.find((w) => w.id === savedId);
      if (match) setActiveWallpaper(match);
    }
  }, [currentWallpaperId]);

  // Subtle falling rain canvas overlay (purely atmospheric, non-obtrusive)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const rainDrops: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];
    const dropCount = 65; // Light count so the wallpaper is crystal clear

    for (let i = 0; i < dropCount; i++) {
      rainDrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 12 + Math.random() * 20,
        speed: 14 + Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.25,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint cyber rain lines
      for (const drop of rainDrops) {
        ctx.strokeStyle = `rgba(41, 255, 255, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 1;
        if (drop.y > height) {
          drop.y = -20;
          drop.x = Math.random() * (width + 50);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Full High-Res Visible Night City Wallpaper */}
      <img
        src={activeWallpaper.url}
        alt="Cyberpunk 2077 Night City Wallpaper"
        className="fixed inset-0 w-full h-full object-cover object-center transition-all duration-700 select-none"
        style={{
          filter: 'brightness(0.92) contrast(1.08)',
        }}
      />

      {/* 2. Light Vignette to frame the edges without hiding the wallpaper */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none opacity-40" />

      {/* 3. Subtle Cyber Rain Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-1" />

      {/* 4. Ultra-faint CRT scanlines */}
      <div className="fixed inset-0 scanlines-overlay opacity-25 pointer-events-none z-2" />
    </div>
  );
}
