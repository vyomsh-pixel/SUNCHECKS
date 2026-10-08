// CyberCityBackdrop: Ultra-Performance Night City Wallpaper Engine
// Engineered for 8GB RAM setups:
// 1. Zero 60 FPS canvas redraw loops (eliminates continuous CPU/VRAM thrashing).
// 2. Pure static hardware-decoded high-res wallpaper display with 100% crisp visibility.
// 3. Lightweight CSS vignette and scanline overlays that never invalidate compositor caches.

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const savedId = currentWallpaperId || localStorage.getItem('cyber_wallpaper_id');
    if (savedId) {
      const match = WALLPAPERS.find((w) => w.id === savedId);
      if (match) setActiveWallpaper(match);
    }
  }, [currentWallpaperId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Full High-Res Visible Night City Wallpaper (Hardware decoded, 0 continuous repaints) */}
      <img
        src={activeWallpaper.url}
        alt="Cyberpunk 2077 Night City Wallpaper"
        className="fixed inset-0 w-full h-full object-cover object-center select-none"
        loading="eager"
        decoding="async"
        style={{
          filter: 'brightness(0.92) contrast(1.08)',
        }}
      />

      {/* 2. Light Vignette to frame the edges without hiding the wallpaper */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none opacity-40" />

      {/* 3. Ultra-faint CRT scanlines (Zero CPU cost pure CSS) */}
      <div className="fixed inset-0 scanlines-overlay opacity-20 pointer-events-none z-1" />
    </div>
  );
}
