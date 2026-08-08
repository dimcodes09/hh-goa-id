'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { drawHalftone } from '@/lib/halftone';
import { COLOR } from '@/lib/tokens';

const STATES = ['OPENING STAMP OFFICE…', 'MIXING INKS…', 'LOADING PRESS…', 'OFFICE OPEN'];
const MIN_MS = 900;
const MAX_MS = 2000;

export default function Loader({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [stateIdx, setStateIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    const start = performance.now();

    const finish = () => {
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      setTimeout(() => {
        if (!mounted) return;
        setProgress(100);
        setStateIdx(3);
        // Drive the actual step transition off a plain timer, not GSAP's onComplete — GSAP's
        // rAF-based ticker stalls while the tab is hidden/backgrounded, which must never wedge the app.
        gsap.to(wrapRef.current, { yPercent: -100, duration: 0.6, ease: 'power3.inOut', delay: 0.25 });
        setTimeout(() => {
          if (mounted) onDone();
        }, 850);
      }, wait);
    };

    const hardCap = setTimeout(finish, MAX_MS);
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.resolve(fontsReady).then(() => {
      clearTimeout(hardCap);
      finish();
    });

    let raf = 0;
    let p = 0;
    const tick = () => {
      p = Math.min(96, p + (96 - p) * 0.06 + 0.35);
      setProgress(p);
      setStateIdx(Math.min(2, Math.floor((p / 96) * 3)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      clearTimeout(hardCap);
      cancelAnimationFrame(raf);
    };
  }, [onDone]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const density = 0.3 + (progressRef.current / 100) * 0.7;
      drawHalftone(ctx, {
        x: 0,
        y: 0,
        w,
        h,
        axis: 'radial-in',
        grid: 15,
        maxRadius: 4 * density,
        colorFrom: COLOR.green,
        colorTo: COLOR.greenMid,
        jitter: 0.25,
        seed: 2,
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--green)]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="font-[var(--font-script)] text-[16px] font-bold text-[var(--yellow)]">2:47pm</div>
          <div className="font-[var(--font-mono)] text-[10px] tracking-[.2em] text-[var(--yellow)]">STUDIO</div>
        </div>
        <div className="w-[240px]">
          <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[var(--cream)]/15">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'repeating-linear-gradient(90deg, var(--yellow) 0 6px, transparent 6px 10px)',
                transition: 'width .15s linear',
              }}
            />
          </div>
        </div>
        <div className="h-4 font-[var(--font-mono)] text-[11px] tracking-[.14em] text-[var(--cream)]/80">{STATES[stateIdx]}</div>
      </div>
    </div>
  );
}
