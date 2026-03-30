'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Full-viewport morphing grid: lines bend with subtle repulsion (near cursor)
 * and attraction (mid ring). pointer-events-none; uses window pointer events.
 */
export default function SiteInteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const targetMouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const stateRef = useRef<{
    cols: number;
    rows: number;
    baseX: Float32Array;
    baseY: Float32Array;
    posX: Float32Array;
    posY: Float32Array;
    velX: Float32Array;
    velY: Float32Array;
    count: number;
    spacing: number;
    dpr: number;
  } | null>(null);

  const buildGrid = useCallback((w: number, h: number, dpr: number) => {
    const spacing = Math.max(40, Math.min(56, Math.floor(Math.min(w, h) / 14)));
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const count = cols * rows;

    const baseX = new Float32Array(count);
    const baseY = new Float32Array(count);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        baseX[i] = c * spacing;
        baseY[i] = r * spacing;
        i++;
      }
    }

    return {
      cols,
      rows,
      baseX,
      baseY,
      posX: Float32Array.from(baseX),
      posY: Float32Array.from(baseY),
      velX: new Float32Array(count),
      velY: new Float32Array(count),
      count,
      spacing,
      dpr,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointer = (e: PointerEvent) => {
      targetMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      targetMouseRef.current = { x: -9999, y: -9999 };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      stateRef.current = buildGrid(w, h, dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const step = () => {
      const st = stateRef.current;
      if (!st) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const { mx, my } = (() => {
        const t = targetMouseRef.current;
        const cur = mouseRef.current;
        const lerp = 0.18;
        cur.x += (t.x - cur.x) * lerp;
        cur.y += (t.y - cur.y) * lerp;
        return { mx: cur.x, my: cur.y };
      })();

      const {
        cols,
        rows,
        count,
        baseX,
        baseY,
        posX,
        posY,
        velX,
        velY,
        dpr,
      } = st;

      const lineColor = document.documentElement.classList.contains('dark')
        ? 'rgba(148,163,184,0.24)'
        : 'rgba(71,85,105,0.22)';

      const kRest = 0.095;
      const repelR = 165;
      const repelS = 4.2;
      const attractLo = 115;
      const attractHi = 400;
      const attractS = 1.15;

      for (let i = 0; i < count; i++) {
        const bx = baseX[i];
        const by = baseY[i];
        let px = posX[i];
        let py = posY[i];

        let ax = (bx - px) * kRest;
        let ay = (by - py) * kRest;

        const dx = px - mx;
        const dy = py - my;
        const d = Math.hypot(dx, dy);
        if (d > 0.5) {
          const ux = dx / d;
          const uy = dy / d;

          if (d < repelR) {
            const t = Math.pow(1 - d / repelR, 1.35);
            ax += ux * t * repelS;
            ay += uy * t * repelS;
          }

          if (d > attractLo && d < attractHi) {
            const ring = (d - attractLo) / (attractHi - attractLo);
            const falloff = (1 - ring) * (1 - ring);
            ax -= ux * falloff * attractS;
            ay -= uy * falloff * attractS;
          }
        }

        velX[i] = velX[i] * 0.86 + ax;
        velY[i] = velY[i] * 0.86 + ay;
        posX[i] += velX[i];
        posY[i] += velY[i];
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.85;

      const idx = (r: number, c: number) => r * cols + c;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(r, c);
          const x0 = posX[i];
          const y0 = posY[i];
          if (c < cols - 1) {
            const j = idx(r, c + 1);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(posX[j], posY[j]);
            ctx.stroke();
          }
          if (r < rows - 1) {
            const j = idx(r + 1, c);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(posX[j], posY[j]);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [buildGrid]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,hsl(var(--background)/0.65),transparent_55%)]" />
    </div>
  );
}
