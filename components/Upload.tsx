'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Upload as UploadIcon, Sparkles, Camera, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  previewUrl: string | null;
  processing: boolean;
  error: string | null;
  onFile: (file: File) => void;
  name: string;
  setName: (v: string) => void;
  stack: string;
  setStack: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Upload({ previewUrl, processing, error, onFile, name, setName, stack, setStack, onBack, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-x-hidden bg-[var(--green)]">
      {/* Background Glow & Watermark */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,212,0,0.08),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-12 top-28 select-none font-[var(--font-mono)] text-[160px] font-bold text-[var(--cream)]/[0.03]">
        गोवा
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between border-b border-[var(--yellow)]/20 bg-[#08271a]/90 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex flex-col text-[14px] font-black leading-none text-[var(--yellow)]" style={{ fontFamily: 'var(--font-display)' }}>
              <span>HACKER</span>
              <span className="text-[12px] text-[var(--pink)]" style={{ fontFamily: 'var(--font-script)' }}>गोवा</span>
              <span>HOUSE</span>
            </div>
            <div className="h-8 w-[2px] bg-[var(--cream)]/20" />
            <div>
              <div className="font-[var(--font-display)] text-[16px] font-extrabold tracking-wider text-[var(--yellow)]">
                HACKER GOA HOUSE
              </div>
              <div className="font-[var(--font-mono)] text-[10px] tracking-[.14em] text-[var(--cream)]/70">
                BUILDER SOCIAL CARD GENERATOR
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 rounded-full border border-[var(--cream)]/20 bg-[var(--cream)]/10 px-3.5 py-1 font-[var(--font-mono)] text-[11px] font-bold tracking-[.1em] text-[var(--yellow)] md:flex">
            <ShieldCheck size={14} /> PASSPORT CONTROL • STEP 01/02
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-[var(--font-mono)] text-[12px] font-bold tracking-[.08em] text-[var(--cream)] transition-all hover:text-[var(--yellow)] hover:-translate-x-1"
          >
            ← HOME
          </button>
          <div
            className="font-[var(--font-script)] font-bold text-[var(--yellow)]"
            style={{ transform: 'rotate(-4deg) skewX(-4deg)', textShadow: '2px 2px 0 rgba(11,47,31,.55)' }}
          >
            <div className="text-[22px] leading-[0.85] sm:text-[26px]">2:47pm</div>
            <div className="text-[10px] tracking-[.12em] sm:text-[11px]">STUDIO</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        {/* Hero Title Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--yellow)]/30 bg-[var(--yellow)]/10 px-4 py-1.5 font-[var(--font-mono)] text-[11px] font-bold tracking-[.14em] text-[var(--yellow)]">
            <span className="h-2 w-2 rounded-full bg-[var(--yellow)] animate-ping" />
            STAMP OFFICE • PHOTO STATION
          </div>

          <h1 className="mt-4 font-[var(--font-display)] text-[clamp(30px,5vw,48px)] font-black leading-tight text-[var(--cream)] drop-shadow-sm">
            Issue Your Builder Pass
          </h1>
          <p className="mt-2 max-w-md font-[var(--font-mono)] text-[12px] tracking-[.04em] text-[var(--cream)]/75 sm:text-[13px]">
            Present your photograph &amp; developer identity to stamp your official pass.
          </p>
        </div>

        {/* Elevated Custom Form Card */}
        <div
          className="relative w-full max-w-[480px] rounded-3xl border-2 border-[var(--yellow)]/30 p-7 sm:p-9 shadow-2xl backdrop-blur-xl"
          style={{
            background: 'linear-gradient(180deg, rgba(11,47,31,0.92) 0%, rgba(7,33,22,0.96) 100%)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.45), 0 0 30px rgba(255,212,0,0.06)',
          }}
        >
          {/* Photo Section */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between font-[var(--font-mono)] text-[11px] font-bold tracking-[.14em] text-[var(--yellow)]">
              <span>01. BUILDER PHOTOGRAPH</span>
              <span className="text-[var(--cream)]/50">REQUIRED</span>
            </div>

            <div className="relative">
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) onFile(f);
                }}
                className="group relative flex h-[220px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300"
                style={{
                  background: 'rgba(251,243,222,0.95)',
                  borderColor: dragOver ? 'var(--pink)' : 'rgba(11,47,31,.4)',
                  transform: dragOver ? 'scale(1.015)' : undefined,
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                {previewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Your photo" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/40 opacity-0 transition-opacity group-hover:opacity-100 font-[var(--font-mono)] text-[12px] font-bold text-[var(--cream)] tracking-wider">
                      CLICK TO CHANGE PHOTO
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3.5 px-6 text-center text-[var(--ink)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--ink)]/30 bg-[var(--green)]/10 text-[var(--ink)] transition-transform group-hover:scale-110">
                      <Camera size={26} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="font-[var(--font-mono)] text-[13px] font-bold tracking-[.04em]">
                        DRAG &amp; DROP FIT PIC OR CLICK TO UPLOAD
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-2 font-[var(--font-mono)] text-[10px] tracking-[.08em] opacity-60">
                        <span className="rounded bg-[var(--ink)]/10 px-1.5 py-0.5">JPG</span>
                        <span className="rounded bg-[var(--ink)]/10 px-1.5 py-0.5">PNG</span>
                        <span className="rounded bg-[var(--ink)]/10 px-1.5 py-0.5">HEIC</span>
                        <span>• MAX 10MB</span>
                      </div>
                    </div>
                  </div>
                )}

                {processing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/80 font-[var(--font-mono)] text-[13px] font-bold tracking-[.14em] text-[var(--cream)] backdrop-blur-sm">
                    DEVELOPING STAMP PHOTO…
                  </div>
                )}

                {/* Corner Accents */}
                {(['top-0 left-0 border-t-2 border-l-2 border-[var(--pink)] rounded-tl-lg', 'top-0 right-0 border-t-2 border-r-2 border-[var(--pink)] rounded-tr-lg', 'bottom-0 left-0 border-b-2 border-l-2 border-[var(--pink)] rounded-bl-lg', 'bottom-0 right-0 border-b-2 border-r-2 border-[var(--pink)] rounded-br-lg'] as const).map((cls) => (
                  <div key={cls} className={`pointer-events-none absolute m-2.5 h-4 w-4 ${cls}`} />
                ))}
              </div>

              {/* Floating Rubber Stamp Badge */}
              <motion.div
                initial={{ rotate: 12 }}
                animate={{ rotate: [12, -4, 12] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="pointer-events-none absolute -right-5 -top-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed text-center shadow-xl"
                style={{ background: 'var(--cream)', borderColor: 'var(--pink)' }}
              >
                <span className="font-[var(--font-script)] text-[11px] font-bold leading-tight text-[var(--pink)]">
                  no cap,
                  <br />
                  lock in
                </span>
              </motion.div>
            </div>
          </div>

          {error && <div className="mt-3 font-[var(--font-mono)] text-[12px] text-[var(--pink)]">{error}</div>}

          {previewUrl && (
            <div className="mt-2.5 text-center">
              <button
                onClick={() => inputRef.current?.click()}
                className="font-[var(--font-mono)] text-[11px] font-bold tracking-[.08em] text-[var(--teal)] underline hover:opacity-80"
              >
                RE-UPLOAD PHOTOGRAPH
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = '';
            }}
          />

          {/* Developer Details Section */}
          <div className="mt-7 flex flex-col gap-4">
            <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[.14em] text-[var(--yellow)]">
              02. DEVELOPER CREDENTIALS (REQUIRED)
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 font-[var(--font-mono)] text-[10px] font-bold tracking-[.12em] text-[var(--cream)]/75">
                <User size={12} className="text-[var(--yellow)]" /> FULL NAME *
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                placeholder="e.g. Satoshi Nakamoto"
                className="w-full rounded-xl border border-[var(--cream)]/20 bg-[var(--cream)]/10 px-4 py-3 font-[var(--font-mono)] text-[14px] uppercase tracking-[.06em] text-[var(--cream)] placeholder-[var(--cream)]/35 outline-none transition-all focus:border-[var(--yellow)] focus:bg-[var(--cream)]/15 focus:ring-2 focus:ring-[var(--yellow)]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 font-[var(--font-mono)] text-[10px] font-bold tracking-[.12em] text-[var(--cream)]/75">
                <Sparkles size={12} className="text-[var(--yellow)]" /> STACK / ROLE *
              </span>
              <input
                value={stack}
                onChange={(e) => setStack(e.target.value.slice(0, 26))}
                placeholder="e.g. Full-Stack / Rust / AI"
                className="w-full rounded-xl border border-[var(--cream)]/20 bg-[var(--cream)]/10 px-4 py-3 font-[var(--font-mono)] text-[14px] uppercase tracking-[.06em] text-[var(--cream)] placeholder-[var(--cream)]/35 outline-none transition-all focus:border-[var(--yellow)] focus:bg-[var(--cream)]/15 focus:ring-2 focus:ring-[var(--yellow)]/20"
              />
            </label>
          </div>

          {/* Action CTA Button */}
          {(() => {
            const canProceed = Boolean(previewUrl && name.trim() && stack.trim() && !processing);
            return (
              <>
                <button
                  onClick={onNext}
                  disabled={!canProceed}
                  className="group relative mt-8 flex min-h-[54px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border-2 border-dashed px-6 py-4 font-[var(--font-mono)] text-[15px] font-bold tracking-[.1em] text-[var(--ink)] transition-all disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
                  style={{ background: 'var(--yellow)', borderColor: 'var(--ink)' }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    SELECT STAMP EDITION <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
                {!canProceed && (
                  <div className="mt-2.5 text-center font-[var(--font-mono)] text-[11px] font-bold tracking-wide text-[var(--yellow)]/90">
                    ⚠️ Please upload a photo, enter your Name and Stack/Role to unlock editions.
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-[var(--cream)]/10 py-5 text-center font-[var(--font-mono)] text-[11px] tracking-[.08em] text-[var(--cream)]/60">
        HH GOA 2026 • BUILD IN GOA, SHIP FROM PARADISE
      </footer>
    </div>
  );
}


