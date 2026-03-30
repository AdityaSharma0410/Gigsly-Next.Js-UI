'use client';

import { useCallback, useEffect, useRef } from 'react';

type Ripple = { x: number; y: number; t0: number };

/**
 * Full-viewport morphing grid: cursor uses raw pointer position (no smoothing lag),
 * edges drawn as quadratic curves for fabric-like bend, click ripples expand through AoE.
 */
export default function SiteInteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetMouseRef = useRef({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
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

    /** Ripple on “background” clicks — skip interactive controls */
    const onPointerDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (
        el.closest(
          'a, button, input, textarea, select, option, label, [role="button"], [role="tab"], [role="menuitem"], [data-no-grid-ripple]'
        )
      ) {
        return;
      }
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
      if (ripplesRef.current.length > 6) ripplesRef.current.shift();
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
    window.addEventListener('pointerdown', onPointerDown, { capture: true });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const idx = (cols: number, r: number, c: number) => r * cols + c;

    const step = () => {
      const st = stateRef.current;
      if (!st) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const now = performance.now();

      const mx = targetMouseRef.current.x;
      const my = targetMouseRef.current.y;

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

      const isDark = document.documentElement.classList.contains('dark');
      const lineColor = isDark ? 'rgba(203, 213, 225, 0.52)' : 'rgba(71, 85, 105, 0.32)';

      const kRest = 0.118;
      const repelR = 165;
      const repelS = 4.2;
      const attractLo = 115;
      const attractHi = 400;
      const attractS = 1.15;

      const velDamp = 0.89;

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

        const ripples = ripplesRef.current;
        for (let ri = 0; ri < ripples.length; ri++) {
          const rp = ripples[ri];
          const age = (now - rp.t0) / 1000;
          if (age > 2.2) continue;

          const rdx = px - rp.x;
          const rdy = py - rp.y;
          const dist = Math.hypot(rdx, rdy) || 1e-6;
          const rux = rdx / dist;
          const ruy = rdy / dist;

          const rippleAoE = 340;
          if (dist > rippleAoE) continue;

          const waveSpeed = 380;
          const wavePos = age * waveSpeed;
          const ringEnvelope = Math.exp(-Math.pow((dist - wavePos) / 42, 2));
          const timeDecay = Math.exp(-age * 1.05);
          const spatialFalloff = Math.max(0, 1 - dist / rippleAoE);
          const amp = ringEnvelope * timeDecay * spatialFalloff * 11;

          ax += rux * amp;
          ay += ruy * amp;

          const tx = -ruy;
          const ty = rux;
          const twist = ringEnvelope * timeDecay * spatialFalloff * Math.sin(dist * 0.045 - age * 8) * 1.8;
          ax += tx * twist;
          ay += ty * twist;
        }

        velX[i] = velX[i] * velDamp + ax;
        velY[i] = velY[i] * velDamp + ay;
        posX[i] += velX[i];
        posY[i] += velY[i];
      }

      ripplesRef.current = ripplesRef.current.filter((r) => now - r.t0 < 2200);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = isDark ? 2.25 : 1.65;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = isDark ? 1 : 0.92;

      /** Straight segments by default; sub-pixel quadratic only when cursor is near edge midpoint. */
      const curveFalloffPx = 210;
      const maxBulgePx = 2.15;

      const drawEdge = (ia: number, ib: number) => {
        const x0 = posX[ia];
        const y0 = posY[ia];
        const x1 = posX[ib];
        const y1 = posY[ib];
        const bx0 = baseX[ia];
        const by0 = baseY[ia];
        const bx1 = baseX[ib];
        const by1 = baseY[ib];

        const mxx = (x0 + x1) * 0.5;
        const myy = (y0 + y1) * 0.5;
        const ex = x1 - x0;
        const ey = y1 - y0;
        const el = Math.hypot(ex, ey) || 1e-6;
        const nx = -ey / el;
        const ny = ex / el;

        const d0x = x0 - bx0;
        const d0y = y0 - by0;
        const d1x = x1 - bx1;
        const d1y = y1 - by1;
        const m0 = Math.hypot(d0x, d0y);
        const m1 = Math.hypot(d1x, d1y);
        const dispSum = m0 + m1;

        const edx = mxx - mx;
        const edy = myy - my;
        const dMouse = Math.hypot(edx, edy);
        const near =
          mx < -9000
            ? 0
            : Math.exp(-(dMouse * dMouse) / (curveFalloffPx * curveFalloffPx));

        const signed = (d0x + d1x) * nx + (d0y + d1y) * ny;
        const dir = Math.abs(signed) > 0.004 ? Math.sign(signed) : 1;

        const bulge =
          near > 0.02
            ? Math.min(maxBulgePx, near * (0.35 + dispSum * 0.022)) * dir
            : 0;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        if (Math.abs(bulge) < 0.12) {
          ctx.lineTo(x1, y1);
        } else {
          const cpx = mxx + nx * bulge;
          const cpy = myy + ny * bulge;
          ctx.quadraticCurveTo(cpx, cpy, x1, y1);
        }
        ctx.stroke();
      };

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(cols, r, c);
          if (c < cols - 1) {
            drawEdge(i, idx(cols, r, c + 1));
          }
          if (r < rows - 1) {
            drawEdge(i, idx(cols, r + 1, c));
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
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
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
