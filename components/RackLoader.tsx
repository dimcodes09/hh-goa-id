'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { drawHalftone } from '@/lib/halftone';
import { COLOR } from '@/lib/tokens';
import { Sparkles, Layers, ShieldCheck, Flame } from 'lucide-react';

const GENZ_STATUSES = [
  'COOKING YOUR CUSTOM CARD MATRIX… 🔥',
  'LOCKING IN MAXIMUM AURA… ⚡',
  'RETRIEVING RACK EDITIONS (NO CAP)… 🎟️',
  'CHOOSE YOUR FLEX & GOATED PASS! 🚀',
];

export default function RackLoader({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    const startTime = performance.now();
    const DURATION = 800; // Fast smooth 800ms progress run

    const timer = setInterval(() => {
      if (!mounted) return;
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setProgress(pct);

      const idx = Math.min(GENZ_STATUSES.length - 1, Math.floor((pct / 100) * GENZ_STATUSES.length));
      setStatusIdx(idx);

      if (elapsed >= DURATION) {
        clearInterval(timer);
        setProgress(100);
        setStatusIdx(GENZ_STATUSES.length - 1);
        setTimeout(() => {
          if (mounted) onDone();
        }, 120);
      }
    }, 16);

    const hardCap = setTimeout(() => {
      if (mounted) {
        clearInterval(timer);
        setProgress(100);
        onDone();
      }
    }, 1100);

    return () => {
      mounted = false;
      clearInterval(timer);
      clearTimeout(hardCap);
    };
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderHalftone = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawHalftone(ctx, {
        x: 0,
        y: 0,
        w,
        h,
        axis: 'radial-in',
        grid: 16,
        maxRadius: 4.5,
        colorFrom: COLOR.green,
        colorTo: COLOR.greenMid,
        jitter: 0.3,
        seed: 7,
      });
    };

    renderHalftone();
    window.addEventListener('resize', renderHalftone);
    return () => window.removeEventListener('resize', renderHalftone);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-[var(--green)] px-6 py-8"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Header Bar */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-[12px] font-black leading-none text-[var(--yellow)]" style={{ fontFamily: 'var(--font-display)' }}>
            <span>HACKER</span>
            <span className="text-[10px] text-[var(--pink)]" style={{ fontFamily: 'var(--font-script)' }}>गोवा</span>
            <span>HOUSE</span>
          </div>
          <div className="h-6 w-[2px] bg-[var(--cream)]/20" />
          <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[.12em] text-[var(--yellow)]">
            STAMP VAULT
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[var(--yellow)]/30 bg-[var(--yellow)]/10 px-3 py-1 font-[var(--font-mono)] text-[10px] font-bold tracking-[.12em] text-[var(--yellow)]">
          <Sparkles size={12} /> UNLOCKING EDITIONS
        </div>
      </div>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* Palm Sticker Icon with Floating Badges */}
        <div className="relative mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/palm.png"
            alt="Palm Sticker"
            className="h-24 w-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] sm:h-28 sm:w-28 animate-pulse"
          />

          <motion.div
            initial={{ rotate: -12, scale: 0.8 }}
            animate={{ rotate: [-12, 6, -12], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-10 -top-2 rounded-full border border-dashed border-[var(--pink)] bg-[var(--cream)] px-2.5 py-1 text-[9px] font-bold tracking-wider text-[var(--pink)] shadow-md"
            style={{ fontFamily: 'var(--font-script)' }}
          >
            NO CAP 🧢
          </motion.div>

          <motion.div
            initial={{ rotate: 14, scale: 0.9 }}
            animate={{ rotate: [14, -8, 14], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-12 bottom-0 rounded-full border border-dashed border-[var(--yellow)] bg-[var(--green)] px-3 py-1 text-[10px] font-bold tracking-wider text-[var(--yellow)] shadow-lg"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            MAX AURA ✨
          </motion.div>
        </div>

        {/* Title & Tagline */}
        <h2 className="font-[var(--font-display)] text-[clamp(26px,4.5vw,42px)] font-black leading-tight text-[var(--yellow)] drop-shadow-md">
          CHOOSE YOUR CUSTOM CARD
        </h2>
        <p className="mt-1 font-[var(--font-mono)] text-[12px] tracking-[.1em] text-[var(--cream)]/80 sm:text-[13px]">
          CURATING EXCLUSIVE GOA STAMP EDITIONS
        </p>

        {/* Progress Bar Container */}
        <div className="mt-7 w-[min(85vw,340px)]">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[var(--cream)]/20 bg-[var(--ink)]/60 p-0.5">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--yellow) 0%, var(--pink) 100%)',
                boxShadow: '0 0 12px var(--yellow)',
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-[var(--font-mono)] text-[10px] tracking-[.1em] text-[var(--cream)]/60">
            <span>STAMP RACK</span>
            <span className="font-bold text-[var(--yellow)]">{progress}%</span>
          </div>
        </div>

        {/* Status Message Ticker */}
        <div className="mt-6 flex h-8 items-center justify-center rounded-lg border border-[var(--cream)]/15 bg-[var(--green)]/60 px-4 font-[var(--font-mono)] text-[11px] font-bold tracking-[.08em] text-[var(--cream)] shadow-inner">
          {GENZ_STATUSES[statusIdx]}
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="relative z-10 font-[var(--font-mono)] text-[10px] tracking-[.14em] text-[var(--cream)]/50">
        HH GOA 2026 • READY TO FLEX YOUR IDENTITY
      </div>
    </div>
  );
}
