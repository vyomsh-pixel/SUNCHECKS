// CyberCityBackdrop: Cinematic Cyberpunk Night City Engine
// 4-layer parallax megabuildings, glowing holographic neon ads, laser spotlights,
// sky-lane aerodyne traffic, and angled rain with CRT scanlines.

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
      buildCity();
    };
    window.addEventListener('resize', handleResize);

    // 1. Torrential Cyber Rain
    const rainCount = 180;
    const rainDrops: { x: number; y: number; length: number; speed: number; color: string }[] = [];
    const rainColors = ['rgba(0, 240, 255, 0.45)', 'rgba(252, 238, 10, 0.35)', 'rgba(255, 0, 60, 0.3)'];

    for (let i = 0; i < rainCount; i++) {
      rainDrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 16 + Math.random() * 24,
        speed: 16 + Math.random() * 14,
        color: rainColors[Math.floor(Math.random() * rainColors.length)],
      });
    }

    // 2. Parallax Skyline Layers
    interface Building {
      x: number;
      width: number;
      height: number;
      layer: number;
      color: string;
      winColor: string;
      windows: { rx: number; ry: number }[];
      antennaHeight?: number;
      sign?: { text: string; color: string; sub: string };
    }

    let buildings: Building[] = [];

    const buildCity = () => {
      buildings = [];
      const signs = [
        { text: 'CYBERPULSE', color: '#FCEE0A', sub: '2077 // V2' },
        { text: 'ARASAKA', color: '#FF003C', sub: 'CORP HQ' },
        { text: 'NETRUNNER', color: '#00F0FF', sub: '夜の街' },
        { text: 'NIGHT CITY', color: '#FCEE0A', sub: 'DISTRICT 04' },
        { text: 'KANG TAO', color: '#00FF66', sub: 'SEC_NET' },
      ];

      // Layer 1 (Far background silhouettes)
      let cx = -50;
      while (cx < width + 100) {
        const bw = 80 + Math.random() * 110;
        const bh = height * 0.45 + Math.random() * (height * 0.25);
        buildings.push({
          x: cx,
          width: bw,
          height: bh,
          layer: 1,
          color: '#080811',
          winColor: 'rgba(0, 240, 255, 0.25)',
          windows: [],
        });
        cx += bw - 15;
      }

      // Layer 2 (Midground towers with neon windows & holo-signs)
      cx = -30;
      let signIdx = 0;
      while (cx < width + 100) {
        const bw = 90 + Math.random() * 120;
        const bh = height * 0.3 + Math.random() * (height * 0.35);
        const hasSign = Math.random() > 0.45 && signIdx < signs.length;
        const assignedSign = hasSign ? signs[signIdx++] : undefined;

        // Populate dense window grids
        const wins: { rx: number; ry: number }[] = [];
        const cols = Math.floor(bw / 12);
        const rows = Math.floor(bh / 16);

        for (let r = 2; r < rows - 1; r++) {
          for (let c = 1; c < cols - 1; c++) {
            if (Math.random() > 0.42) {
              wins.push({ rx: c * 12, ry: r * 16 });
            }
          }
        }

        buildings.push({
          x: cx,
          width: bw,
          height: bh,
          layer: 2,
          color: '#0C0D17',
          winColor: Math.random() > 0.5 ? 'rgba(252, 238, 10, 0.65)' : 'rgba(0, 240, 255, 0.65)',
          windows: wins,
          antennaHeight: Math.random() > 0.4 ? 35 + Math.random() * 40 : undefined,
          sign: assignedSign,
        });
        cx += bw - 10;
      }
    };
    buildCity();

    // 3. Sky-Lane Aerodynes (Hover vehicles with long neon trails)
    const aerodynes = [
      { x: -100, y: height * 0.22, speed: 3.5, color: '#00F0FF', len: 70 },
      { x: width + 100, y: height * 0.29, speed: -2.8, color: '#FF003C', len: 65 },
      { x: width * 0.3, y: height * 0.4, speed: 4.2, color: '#FCEE0A', len: 80 },
      { x: width + 50, y: height * 0.16, speed: -2.2, color: '#00F0FF', len: 60 },
    ];

    // 4. Sweeping Spotlight Beams
    let spotlightAngle = 0;

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep Night City Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#040407');
      skyGrad.addColorStop(0.35, '#090814');
      skyGrad.addColorStop(0.7, '#140A1C'); // Deep magenta smog horizon
      skyGrad.addColorStop(1, '#070C18');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant Neon Horizon Volumetric Smog Glow
      const smogGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.68,
        30,
        width * 0.5,
        height * 0.68,
        width * 0.8
      );
      smogGrad.addColorStop(0, 'rgba(255, 0, 60, 0.16)');
      smogGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.12)');
      smogGrad.addColorStop(0.7, 'rgba(252, 238, 10, 0.06)');
      smogGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = smogGrad;
      ctx.fillRect(0, 0, width, height);

      // Sweeping Laser Spotlight
      spotlightAngle = Math.sin(tick * 0.008) * 0.45;
      ctx.save();
      ctx.translate(width * 0.25, height * 0.7);
      ctx.rotate(spotlightAngle - 0.4);
      const beamGrad = ctx.createLinearGradient(0, 0, 0, -height * 0.8);
      beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(-70, -height * 0.85);
      ctx.lineTo(70, -height * 0.85);
      ctx.lineTo(15, 0);
      ctx.fill();
      ctx.restore();

      // Second Spotlight
      ctx.save();
      ctx.translate(width * 0.75, height * 0.7);
      ctx.rotate(-spotlightAngle + 0.35);
      const beamGrad2 = ctx.createLinearGradient(0, 0, 0, -height * 0.8);
      beamGrad2.addColorStop(0, 'rgba(255, 0, 60, 0.2)');
      beamGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-60, -height * 0.85);
      ctx.lineTo(60, -height * 0.85);
      ctx.lineTo(10, 0);
      ctx.fill();
      ctx.restore();

      // Render Megabuildings (Layer by Layer)
      for (const b of buildings) {
        const topY = height - b.height;

        // Building Facade
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, topY, b.width, b.height);

        // Neon outline roof edge
        ctx.strokeStyle = b.layer === 2 ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 0, 60, 0.12)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(b.x, topY, b.width, b.height);

        // Antenna with blinking warning light
        if (b.antennaHeight) {
          ctx.strokeStyle = 'rgba(252, 238, 10, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x + b.width / 2, topY);
          ctx.lineTo(b.x + b.width / 2, topY - b.antennaHeight);
          ctx.stroke();

          // Blinking red beacon
          const isBlink = Math.sin(tick * 0.08 + b.x) > 0.1;
          if (isBlink) {
            ctx.fillStyle = '#FF003C';
            ctx.shadowColor = '#FF003C';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(b.x + b.width / 2, topY - b.antennaHeight, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Windows
        if (b.windows.length > 0) {
          ctx.fillStyle = b.winColor;
          for (const w of b.windows) {
            ctx.fillRect(b.x + w.rx, topY + w.ry, 4.5, 6);
          }
        }

        // Holographic Billboard Sign
        if (b.sign) {
          const signY = topY + 20;
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(b.x + 8, signY, b.width - 16, 36);

          ctx.strokeStyle = b.sign.color;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = b.sign.color;
          ctx.shadowBlur = 10;
          ctx.strokeRect(b.x + 8, signY, b.width - 16, 36);

          ctx.fillStyle = b.sign.color;
          ctx.font = 'bold 11px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(b.sign.text, b.x + b.width / 2, signY + 18);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '8px "Share Tech Mono", monospace';
          ctx.fillText(b.sign.sub, b.x + b.width / 2, signY + 30);
          ctx.restore();
        }
      }

      // Sky-Lane Aerodynes (Cruising with neon trails)
      for (const aero of aerodynes) {
        aero.x += aero.speed;
        if (aero.speed > 0 && aero.x > width + 120) aero.x = -100;
        if (aero.speed < 0 && aero.x < -120) aero.x = width + 100;

        // Vehicle Headlight
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(aero.x, aero.y, 10, 3);

        // Long Glowing Jet Trail
        const trailGrad = ctx.createLinearGradient(
          aero.x,
          aero.y,
          aero.x - (aero.speed > 0 ? aero.len : -aero.len),
          aero.y
        );
        trailGrad.addColorStop(0, aero.color);
        trailGrad.addColorStop(1, 'transparent');

        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 3;
        ctx.shadowColor = aero.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(aero.x, aero.y + 1.5);
        ctx.lineTo(aero.x - (aero.speed > 0 ? aero.len : -aero.len), aero.y + 1.5);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Torrential Neon Rain (Angled)
      for (const drop of rainDrops) {
        drop.y += drop.speed;
        drop.x -= 3; // Slanted trajectory

        if (drop.y > height) {
          drop.y = -20;
          drop.x = Math.random() * (width + 120);
        }

        ctx.strokeStyle = drop.color;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 4, drop.y + drop.length);
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
      {/* Subtle CRT Scanline overlay giving authentic Night City HUD feel */}
      <div className="absolute inset-0 scanlines-overlay opacity-60 pointer-events-none" />
      {/* Cinematic dark tint with edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(7, 8, 14, 0.4) 0%, rgba(5, 6, 8, 0.88) 100%)',
        }}
      />
    </div>
  );
}
