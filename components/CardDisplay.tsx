'use client';

import { useMemo } from 'react';
import type { EditionId } from '@/lib/tokens';
import type { Identity } from '@/lib/identity';

interface CardDisplayProps {
  editionId: EditionId;
  photoUrl?: string | null;
  name: string;
  stack: string;
  identity: Identity;
  className?: string;
}

function generateQRPath(builderId: string) {
  let hash = 0;
  for (let i = 0; i < builderId.length; i++) {
    hash = (hash * 31 + builderId.charCodeAt(i)) >>> 0;
  }
  const rects: string[] = [];
  // Corner finders
  rects.push('M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4z');
  // Data bits
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      hash = (hash * 1664525 + 1013904223) >>> 0;
      if (hash % 2 === 0) {
        const x = 12 + c * 2;
        const y = 12 + r * 2;
        rects.push(`M${x} ${y}h1.8v1.8H${x}z`);
      }
    }
  }
  return rects.join(' ');
}

export default function CardDisplay({
  editionId,
  photoUrl,
  name,
  stack,
  identity,
  className = '',
}: CardDisplayProps) {
  const displayName = name.trim() ? name.trim().toUpperCase() : 'YOUR NAME';
  const displayRole = stack.trim() ? stack.trim().toUpperCase() : 'DEVELOPER / ROLE';
  const displayClass = identity.cls ? identity.cls.toUpperCase() : 'TERMINAL WIZARD';
  const builderId = identity.builderId || '#HH26-9837';
  const qrPath = useMemo(() => generateQRPath(builderId), [builderId]);

  // Theme-specific styling variables
  const isSundown = editionId === 'sundown';
  const isPostcard = editionId === 'postcard';
  const isTransit = editionId === 'transit';

  return (
    <div
      className={`relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-[20px] p-4 text-[var(--ink)] shadow-2xl transition-all ${className}`}
      style={{
        background: isSundown
          ? 'linear-gradient(180deg, #184e36 0%, #0d3824 50%, #051f13 100%)'
          : isTransit
          ? 'linear-gradient(180deg, #07291a 0%, #03140c 100%)'
          : isPostcard
          ? '#faf3df'
          : '#fbf3de',
        border: isSundown
          ? '3px solid #ffd400'
          : isTransit
          ? '3px solid #a3e635'
          : '3px solid #0b2f1f',
        color: isSundown || isTransit ? '#fbf3de' : '#0b2f1f',
      }}
    >
      {/* Background Halftone / Sunburst Artwork */}
      {isSundown ? (
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#ffd400_0%,transparent_70%)] blur-2xl" />
        </div>
      ) : isTransit ? (
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="h-full w-full bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[radial-gradient(#0b2f1f_1px,transparent_1px)] [background-size:14px_14px]" />
        </div>
      )}

      {/* Airmail Border Stripes for Postcard Edition */}
      {isPostcard && (
        <div className="pointer-events-none absolute inset-1.5 rounded-[16px] border-2 border-dashed border-[#0b2f1f]/30" />
      )}

      {/* Lanyard Clip Slot at top center */}
      <div className="absolute -top-1 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
        <div className="h-4 w-10 rounded-b-md bg-zinc-900 shadow-md" />
        <div className="flex h-5 items-center rounded-b-lg border border-pink-500 bg-[#f2226b] px-3 font-mono text-[9px] font-black tracking-widest text-white shadow-sm">
          HH GOA 2026
        </div>
      </div>

      {/* Top Stamps & Header Area */}
      <div className="relative z-10 pt-4">
        {/* Top Header Stamps */}
        <div className="flex items-start justify-between">
          {/* Top Left: Postage Stamp */}
          <div className="flex flex-col items-center rounded border border-dashed border-emerald-800 bg-[#fbf3de] p-1 shadow-sm">
            <div className="flex h-10 w-12 flex-col items-center justify-center rounded bg-[#0b2f1f] p-1 text-center font-mono text-[8px] font-extrabold text-[#ffd400]">
              <span>GOA</span>
              <span className="text-[7px] text-[#f2226b]">INDIA</span>
              <span className="text-[10px]">🌴</span>
            </div>
          </div>

          {/* Top Right: Circular Rubber Postmark Seal */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#0b2f1f]/60 p-1 text-center font-mono text-[7px] font-extrabold text-[#0b2f1f]/80">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
              <text fontSize="9.5" fontWeight="bold" fill={isSundown || isTransit ? '#ffd400' : '#0b2f1f'}>
                <textPath href="#circlePath" startOffset="0%">
                  BUILD IN GOA • SHIP FROM PARADISE •
                </textPath>
              </text>
            </svg>
            <span className="text-[12px]">★</span>
          </div>
        </div>

        {/* Main Title Banner: HACKER GOA HOUSE */}
        <div className="mt-1 text-center">
          <div className="flex items-center justify-center gap-1.5 font-black leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-[clamp(20px,4vw,32px)] text-[#0b2f1f]" style={{ color: isSundown ? '#ffd400' : isTransit ? '#a3e635' : '#0b2f1f' }}>
              HACKER
            </span>
            <span className="text-[clamp(22px,4.5vw,36px)] text-[#f2226b]" style={{ fontFamily: 'var(--font-script)' }}>
              गोवा
            </span>
            <span className="text-[clamp(20px,4vw,32px)] text-[#0b2f1f]" style={{ color: isSundown ? '#ffd400' : isTransit ? '#a3e635' : '#0b2f1f' }}>
              HOUSE
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[9px] font-bold tracking-[0.18em] text-[#f2226b]">
            ✦ BUILD IN GOA, SHIP FROM PARADISE ✦
          </div>
        </div>
      </div>

      {/* Middle Section: Photo (Left) + Builder Details (Right) */}
      <div className="relative z-10 my-2 flex items-center gap-3 px-1">
        {/* Photo Container */}
        <div className="relative flex-shrink-0">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#f2226b] p-1 shadow-lg sm:h-32 sm:w-32" style={{ background: 'linear-gradient(135deg, #ffd400, #f2226b)' }}>
            <div className="h-full w-full overflow-hidden rounded-full bg-slate-200">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#0b2f1f] text-3xl font-black text-[#ffd400]">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>
          {/* BUILDER Sticker Chip */}
          <div
            className="absolute -bottom-2 -left-2 rounded-full border border-white bg-[#f2226b] px-2.5 py-0.5 font-mono text-[9px] font-black tracking-wider text-white shadow-md"
            style={{ transform: 'rotate(-8deg)' }}
          >
            BUILDER
          </div>
        </div>

        {/* Details Column */}
        <div className="flex flex-1 flex-col justify-center overflow-hidden">
          {/* Name */}
          <h3
            className="truncate text-[clamp(18px,3.5vw,26px)] font-black leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: isSundown ? '#ffffff' : isTransit ? '#fbf3de' : '#0b2f1f',
            }}
          >
            {displayName}
          </h3>

          {/* Role / Stack subtitle */}
          <div className="mt-0.5 truncate font-mono text-[10px] font-extrabold tracking-wider text-[#f2226b]">
            ✦ {displayRole} ✦
          </div>

          <div className="my-1.5 h-[1px] w-full bg-[#0b2f1f]/20" />

          {/* Badges Stack */}
          <div className="space-y-1 font-mono text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🌴</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[8px] font-bold text-[#0b2f1f]/60" style={{ color: isSundown || isTransit ? 'rgba(251,243,222,0.6)' : undefined }}>
                  BUILDER CLASS
                </span>
                <span className="font-extrabold text-[#f2226b]">{displayClass}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs">💻</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[8px] font-bold text-[#0b2f1f]/60" style={{ color: isSundown || isTransit ? 'rgba(251,243,222,0.6)' : undefined }}>
                  SKILLS / STACK
                </span>
                <span className="truncate font-extrabold" style={{ color: isSundown ? '#ffd400' : isTransit ? '#a3e635' : '#0b2f1f' }}>
                  {displayRole}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs">✉️</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[8px] font-bold text-[#0b2f1f]/60" style={{ color: isSundown || isTransit ? 'rgba(251,243,222,0.6)' : undefined }}>
                  TEAM VIBES
                </span>
                <span className="font-extrabold text-[#f2226b]">BUILD • SHIP • REPEAT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Scenery, Signpost, Builder ID & QR Code */}
      <div className="relative z-10 mt-1">
        {/* Scenery Background Strip (Huts, Scooter, Beach, Sun) */}
        <div className="relative overflow-hidden rounded-xl border border-[#0b2f1f]/20 bg-emerald-900/10 p-2">
          <div className="flex items-end justify-between">
            {/* Left: Directional Wooden Signpost */}
            <div className="flex flex-col gap-0.5 font-mono text-[8px] font-black">
              <div className="rounded-r bg-[#ffd400] px-2 py-0.5 text-[#0b2f1f] shadow-sm">BUILD</div>
              <div className="rounded-r bg-[#f2226b] px-2 py-0.5 text-white shadow-sm">SHIP</div>
              <div className="rounded-r bg-[#0b2f1f] px-2 py-0.5 text-[#ffd400] shadow-sm">REPEAT</div>
            </div>

            {/* Middle: Builder ID Card */}
            <div className="flex flex-col rounded-lg bg-[#0b2f1f] p-2 text-center text-[#fbf3de] shadow-md">
              <span className="font-mono text-[8px] font-bold tracking-widest text-[#ffd400]">BUILDER ID</span>
              <span className="font-mono text-sm font-black text-white">{builderId}</span>
              <span className="font-mono text-[7px] text-[#f2226b]">GOA, INDIA • 28-31 OCT 2026</span>
            </div>

            {/* Right: QR Code & Approved Seal */}
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#0b2f1f] bg-white p-1 shadow-sm">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 24 24" className="h-full w-full fill-[#0b2f1f]">
                  <path d={qrPath} />
                </svg>
              </div>
              <span className="mt-0.5 font-mono text-[7px] font-bold text-[#f2226b]">✦ SCAN TO EXPLORE ✦</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner: ✦ #FRAMEINGOA ✦ */}
        <div className="mt-2 flex h-7 items-center justify-center rounded-lg border border-white bg-[#f2226b] font-mono text-[10px] font-black tracking-widest text-white shadow-md">
          ✦ #FRAMEINGOA ✦
        </div>
      </div>
    </div>
  );
}
