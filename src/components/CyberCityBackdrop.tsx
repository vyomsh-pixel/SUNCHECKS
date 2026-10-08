// CyberCityBackdrop: High-performance live looping Cyberpunk Night City backdrop
// Features animated neon rain, skyscraper silhouettes, glowing holo-billboards,
// and aerodynamic flying vehicles with neon jet trails.

import { useEffect, useRef } from 'react';

export function CyberCityBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      initBuildings();
    };
    window.addEventListener('resize', handleResize);

    // 1. Rain particles
    const rainCount = 140;
    const rainDrops: { x: number; y: number; length: number; speed: number; color: string }[] = [];
    const colors = ['rgba(0, 240, 255, 0.45)', 'rgba(255, 0, 85, 0.35)', 'rgba(255, 184, 0, 0.3)'];

    for (let i = 0; i < rainCount; i++) {
      rainDrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 12 + Math.random() * 20,
        speed: 14 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // 2. Skyscraper skyline
    interface Building {
      x: number;
      width: number;
      height: number;
      color: string;
      windowColor: string;
      windows: { rx: number; ry: number; lit: boolean }[];
      antenna?: boolean;
    }
    let buildings: Building[] = [];

    const initBuildings = () => {
      buildings = [];
      const bColors = ['#080D1A', '#060A14', '#04070E', '#0B1122'];
      let currentX = 0;

      while (currentX < width + 100) {
        const bWidth = 60 + Math.random() * 90;
        const bHeight = 160 + Math.random() * (height * 0.45);
        const bColor = bColors[Math.floor(Math.random() * bColors.length)];
        const winColor = Math.random() > 0.4 ? 'rgba(0, 240, 255, 0.7)' : 'rgba(255, 184, 0, 0.6)';

        const wins: { rx: number; ry: number; lit: boolean }[] = [];
        const cols = Math.floor(bWidth / 14);
        const rows = Math.floor(bHeight / 22);

        for (let r = 2; r < rows - 1; r++) {
          for (let c = 1; c < cols - 1; c++) {
            if (Math.random() > 0.45) {
              wins.push({ rx: c * 14, ry: r * 22, lit: true });
            }
          }
        }

        buildings.push({
          x: currentX,
          width: bWidth,
          height: bHeight,
          color: bColor,
          windowColor: winColor,
          windows: wins,
          antenna: Math.random() > 0.5,
        });

        currentX += bWidth - 10;
      }
    };
    initBuildings();

    // 3. Flying Aerodynes (flying hover cars)
    const aerodynes = [
      { x: -50, y: height * 0.35, speed: 2.2, color: '#00F0FF', trail: '#00F0FF' },
      { x: width + 50, y: height * 0.22, speed: -1.6, color: '#FF0055', trail: '#FF0055' },
      { x: width * 0.5, y: height * 0.48, speed: 1.8, color: '#FFB800', trail: '#FFB800' },
    ];

    // Animation Loop
    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep cyberpunk sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030509');
      skyGrad.addColorStop(0.5, '#070C1A');
      skyGrad.addColorStop(1, '#0F1A30');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant neon horizon glow
      const horizonGlow = ctx.createRadialGradient(width * 0.5, height * 0.7, 50, width * 0.5, height * 0.7, width * 0.8);
      horizonGlow.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      horizonGlow.addColorStop(0.5, 'rgba(255, 0, 85, 0.08)');
      horizonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, height);

      // Render buildings
      for (const b of buildings) {
        const topY = height - b.height;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, topY, b.width, b.height);

        // Neon edge border
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, topY, b.width, b.height);

        // Antenna
        if (b.antenna) {
          ctx.beginPath();
          ctx.moveTo(b.x + b.width / 2, topY);
          ctx.lineTo(b.x + b.width / 2, topY - 30);
          ctx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
          ctx.stroke();

          // Blinking light
          if (Math.sin(tick * 0.05 + b.x) > 0) {
            ctx.fillStyle = '#FF0055';
            ctx.beginPath();
            ctx.arc(b.x + b.width / 2, topY - 30, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Windows
        for (const w of b.windows) {
          ctx.fillStyle = b.windowColor;
          ctx.fillRect(b.x + w.rx, topY + w.ry, 6, 8);
        }
      }

      // Flying Aerodynes
      for (const aero of aerodynes) {
        aero.x += aero.speed;
        if (aero.speed > 0 && aero.x > width + 100) aero.x = -80;
        if (aero.speed < 0 && aero.x < -100) aero.x = width + 80;

        // Vehicle body
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(aero.x, aero.y, 14, 4);

        // Jet trail
        const trailGrad = ctx.createLinearGradient(
          aero.x,
          aero.y,
          aero.x - aero.speed * 20,
          aero.y
        );
        trailGrad.addColorStop(0, aero.trail);
        trailGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(aero.x, aero.y + 2);
        ctx.lineTo(aero.x - aero.speed * 25, aero.y + 2);
        ctx.stroke();
      }

      // Neon rain (angled)
      for (const drop of rainDrops) {
        drop.y += drop.speed;
        drop.x -= 2; // subtle diagonal slant

        if (drop.y > height) {
          drop.y = -20;
          drop.x = Math.random() * (width + 100);
        }

        ctx.strokeStyle = drop.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 3, drop.y + drop.length);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Obsidian glass blur overlay so text content stands out crisply */}
      <div className="absolute inset-0 bg-[#050811]/75 backdrop-blur-[2px]" />
    </div>
  );
}
