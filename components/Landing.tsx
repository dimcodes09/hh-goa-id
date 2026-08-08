'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { COLOR, EVENT } from '@/lib/tokens';
import { drawPalmCluster } from '@/lib/illustrations';

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColor(c1: string, c2: string, t: number) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return `rgb(${Math.round(lerp(a.r, b.r, t))},${Math.round(lerp(a.g, b.g, t))},${Math.round(lerp(a.b, b.b, t))})`;
}
function tri(c1: string, c2: string, c3: string, t: number) {
  return t < 0.5 ? lerpColor(c1, c2, t * 2) : lerpColor(c2, c3, (t - 0.5) * 2);
}
function noise2D(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.008 + t * 0.4) * 0.5 +
    Math.sin(y * 0.011 - t * 0.32) * 0.3 +
    Math.sin((x + y) * 0.006 + t * 0.22) * 0.2
  );
}

/** Canvas2D animated halftone field — stands in for the three.js shader (same "breathing ink" look, no WebGL risk). */
function ShaderField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const visible = useRef(true);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let running = true;
    let t = 0;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    const onVis = () => {
      running = document.visibilityState === 'visible' && visible.current;
    };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      running = document.visibilityState === 'visible' && visible.current;
    });
    io.observe(canvas);

    const draw = () => {
      if (!running) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = COLOR.green;
      ctx.fillRect(0, 0, w, h);

      const grid = w < 768 ? 22 : 15;
      const cols = Math.ceil(w / grid);
      const rows = Math.ceil(h / grid);
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const parX = ((mx - w / 2) / w) * 6;
      const parY = ((my - h / 2) / h) * 6;

      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const x = i * grid + grid / 2 + parX;
          const y = j * grid + grid / 2 + parY;
          const ramp = y / h;
          const n = noise2D(x, y, t);
          const tcol = Math.min(1, Math.max(0, ramp * 0.75 + n * 0.3 + 0.05));
          let r = 0.6 + n * 1.1 + tcol * 2.6;
          const d = Math.hypot(x - mx, y - my);
          if (d < 160) r += (1 - d / 160) * 3.5;
          if (r <= 0.2) continue;
          ctx.fillStyle = tri(COLOR.ink, COLOR.greenMid, COLOR.lime, tcol);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduced) t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

function PalmDrift() {
  const backRef = useRef<HTMLImageElement>(null);
  const frontRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const render = (w: number, h: number, count: number, scale: number, ink: string) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      drawPalmCluster(ctx, w * 0.02, h * 0.98, { ink, light: 'rgba(0,0,0,0)' }, count, scale);
      drawPalmCluster(ctx, w * 0.62, h * 0.98, { ink, light: 'rgba(0,0,0,0)' }, count, scale * 0.85);
      return c.toDataURL();
    };
    if (backRef.current) backRef.current.src = render(900, 420, 3, 0.85, COLOR.ink);
    if (frontRef.current) frontRef.current.src = render(900, 460, 2, 1.15, COLOR.ink);
  }, []);

  return (
    <>
      <img ref={backRef} alt="" className="drift-back pointer-events-none absolute bottom-0 left-0 w-full opacity-25 mix-blend-multiply" />
      <img ref={frontRef} alt="" className="drift-front pointer-events-none absolute bottom-0 left-0 w-full opacity-40 mix-blend-multiply" />
      <style jsx>{`
        @keyframes driftBack {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes driftFront {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .drift-back { animation: driftBack 12s ease-in-out infinite; }
        .drift-front { animation: driftFront 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .drift-back, .drift-front { animation: none; }
        }
      `}</style>
    </>
  );
}

export default function Landing({ onStart }: { onStart: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (reduced) {
        gsap.set('.hh-reveal', { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' });
        gsap.set('.hh-gova', { opacity: 1, scale: 1, textShadow: '0 0 22px rgba(242,34,107,.55)' });
        return;
      }
      tl.set('.hh-line', { clipPath: 'inset(0 0 100% 0)' })
        .set('.hh-gova', { opacity: 0, scale: 2.2, rotate: -18 })
        .set('.hh-pill', { scaleX: 0, transformOrigin: 'left center' })
        .set('.hh-cta, .hh-sub, .hh-swatches', { opacity: 0, y: 18 })
        .to('.hh-line-hacker', { clipPath: 'inset(0 0 0% 0)', duration: 0.5 })
        .to('.hh-line-house', { clipPath: 'inset(0 0 0% 0)', duration: 0.5 }, '-=0.3')
        .to('.hh-gova', { opacity: 1, scale: 1, rotate: -6, duration: 0.55, ease: 'back.out(2.4)' }, '-=0.25')
        .to('.hh-gova', { textShadow: '0 0 26px rgba(242,34,107,.65)', duration: 0.3 }, '-=0.15')
        .to('.hh-pill', { scaleX: 1, duration: 0.35, ease: 'power2.out' }, '-=0.3')
        .to('.hh-sub', { opacity: 1, y: 0, duration: 0.3 }, '-=0.15')
        .to('.hh-cta', { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)' }, '-=0.1')
        .to('.hh-swatches', { opacity: 1, y: 0, duration: 0.3 }, '-=0.15');

      gsap.to('.hh-dash', { strokeDashoffset: -24, duration: 1.2, repeat: -1, ease: 'linear' });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[var(--green)]">
      <ShaderField />
      <PalmDrift />

      <div className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
        <div
          className="font-[var(--font-script)] font-bold text-[var(--yellow)]"
          style={{ transform: 'rotate(-4deg) skewX(-4deg)', textShadow: '2px 2px 0 rgba(11,47,31,.55)' }}
        >
          <div className="text-[26px] leading-[0.85] sm:text-[32px]">2:47pm</div>
          <div className="text-[12px] tracking-[.12em] sm:text-[14px]">STUDIO</div>
        </div>
        <div className="font-[var(--font-mono)] text-[11px] tracking-[.12em] text-[var(--cream)]/80">GOA STAMP OFFICE</div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:px-12">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0 sm:gap-x-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 0.92 }}>
          <span className="hh-line hh-line-hacker overflow-hidden">
            <span className="block text-[clamp(46px,11vw,110px)] text-[var(--yellow)]">HACKER</span>
          </span>
          <span className="hh-gova inline-block text-[clamp(32px,7vw,74px)] text-[var(--pink)]" style={{ fontFamily: 'var(--font-script)' }}>
            गोवा
          </span>
          <span className="hh-line hh-line-house w-full overflow-hidden sm:w-auto">
            <span className="block text-[clamp(46px,11vw,110px)] text-[var(--yellow)]">HOUSE</span>
          </span>
        </div>

        <div
          className="hh-pill hh-sub mt-8 rounded-full border px-5 py-2.5 font-[var(--font-mono)] text-[11px] tracking-[.14em] text-[var(--cream)] sm:text-[14px]"
          style={{ background: 'rgba(11,47,31,.45)', borderColor: 'rgba(251,243,222,.25)' }}
        >
          {EVENT.location} &nbsp;•&nbsp; {EVENT.dates} &nbsp;•&nbsp; STAMP OFFICE OPEN
        </div>

        <button
          onClick={onStart}
          className="hh-cta relative mt-9 rounded px-9 py-[18px] font-[var(--font-mono)] text-[15px] font-bold tracking-[.08em] text-[var(--ink)] transition-transform hover:scale-[1.04] hover:-rotate-1 active:scale-[0.97]"
          style={{ background: 'var(--yellow)', boxShadow: '0 10px 26px rgba(0,0,0,.35)' }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ borderRadius: 4 }}>
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="3"
              fill="none"
              stroke="rgba(11,47,31,.5)"
              strokeWidth="2"
              strokeDasharray="6 5"
              className="hh-dash"
            />
          </svg>
          GET STAMPED →
        </button>
      </div>

      <DetailStrip />
    </div>
  );
}

function DetailStrip() {
  return (
    <div className="hh-swatches relative z-10 flex flex-col items-center justify-center text-center px-6 py-8 sm:px-10 sm:py-10">
      <div className="relative flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-[var(--font-mono)] text-[12px] font-bold tracking-[.02em] text-[var(--cream)] sm:text-[14px]">
        <span style={{ color: 'var(--yellow)' }}>{EVENT.hashtag}</span>
        <span className="opacity-50">•</span>
        <span>HH GOA {EVENT.year}</span>
        <span className="opacity-50">•</span>
        <span>{EVENT.dates}</span>
        <span className="opacity-50">•</span>
        <span>{EVENT.location}</span>
      </div>
      <div className="relative mt-2 font-[var(--font-mono)] text-[11px] text-[var(--cream)]/70">
        Built for HH Goa {EVENT.year} builders &amp; attendees.
      </div>
    </div>
  );
}
