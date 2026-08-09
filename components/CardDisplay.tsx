import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { EditionId } from '@/lib/tokens';
import type { Identity } from '@/lib/identity';
import { GOA_BG_DATA_URL, GOA_DUSK_BG_DATA_URL } from '@/lib/bgImages';

interface CardDisplayProps {
  editionId: EditionId;
  photoUrl?: string | null;
  name: string;
  stack: string;
  identity: Identity;
  panX?: number;
  panY?: number;
  zoom?: number;
  className?: string;
}

const EDITION_CLASSES: Record<EditionId, string> = {
  credential: 'MAX AURA SHIPPER ⚡',
  sundown: 'GOATED STACK GOD 🐐',
  postcard: 'NO CAP ARCHITECT 🧢',
  transit: 'SIGMA PROTOCOL DEV 🧠',
};

export default function CardDisplay({
  editionId,
  photoUrl,
  name,
  stack,
  identity,
  panX = 0,
  panY = 0,
  zoom = 1,
  className = '',
}: CardDisplayProps) {
  const displayName = name.trim() ? name.trim().toUpperCase() : 'YOUR NAME';
  const displayRole = stack.trim() ? stack.trim().toUpperCase() : 'DEVELOPER / ROLE';

  const displayClass = EDITION_CLASSES[editionId] || identity.cls || 'MAX AURA SHIPPER ⚡';
  const builderId = identity.builderId || '#HH-GOA-7757';

  // Real scannable QR Code
  const [realQrDataUrl, setRealQrDataUrl] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const targetUrl = `https://hh-goa-id-delta.vercel.app/`;
    QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: '#0b2f1f',
        light: '#ffffff',
      },
    }).then((url) => {
      if (mounted) setRealQrDataUrl(url);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isSundown = editionId === 'sundown';
  const isTransit = editionId === 'transit';

  const bgDataUrl = isSundown || isTransit ? GOA_DUSK_BG_DATA_URL : GOA_BG_DATA_URL;
  const borderColor = isSundown ? '#ffd400' : isTransit ? '#a3e635' : '#0b2f1f';

  return (
    <div
      id="builder-card-element"
      className={`relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-[24px] p-3 text-[var(--ink)] shadow-2xl transition-all ${className}`}
      style={{
        border: `4px solid ${borderColor}`,
        color: isSundown || isTransit ? '#fbf3de' : '#0b2f1f',
      }}
    >
      {/* Full Custom Goa Tropical Background Image Element for 100% html2canvas Capture */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgDataUrl}
        alt="Goa Beach Background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* Translucent Theme Tint Overlay for Text Contrast */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity"
        style={{
          background: isSundown
            ? 'linear-gradient(180deg, rgba(24,78,54,0.35) 0%, rgba(5,31,19,0.65) 100%)'
            : isTransit
            ? 'linear-gradient(180deg, rgba(7,41,26,0.4) 0%, rgba(3,20,12,0.7) 100%)'
            : 'linear-gradient(180deg, rgba(250,243,223,0.2) 0%, rgba(251,243,222,0.45) 100%)',
        }}
      />

      {/* Dashed Airmail Border Frame */}
      <div className="pointer-events-none absolute inset-1.5 rounded-[18px] border-2 border-dashed border-[#0b2f1f]/30 z-10" />

      {/* Side Vertical Text Margins */}
      <div className="pointer-events-none absolute -left-7 top-1/2 z-10 -translate-y-1/2 -rotate-90 font-mono text-[7px] font-black tracking-widest text-[#f2226b]">
        ✦ 28 - 31 OCT 2026 ✦
      </div>
      <div className="pointer-events-none absolute -right-6 top-1/2 z-10 -translate-y-1/2 rotate-90 font-mono text-[7px] font-black tracking-widest text-[#f2226b]">
        ✦ GOA, INDIA ✦
      </div>

      {/* Top Lanyard Clip */}
      <div className="absolute -top-1 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
        <div className="h-3.5 w-10 rounded-b-md bg-zinc-900 shadow-md" />
        <div className="flex h-5 items-center gap-1 rounded-b-lg border border-pink-500 bg-[#f2226b] px-3 font-mono text-[8px] font-black tracking-widest text-white shadow-sm">
          <span>🌴</span>
          <span>HH GOA 2026</span>
        </div>
      </div>

      {/* Top Stamps & Header Area */}
      <div className="relative z-10 pt-3 px-1">
        <div className="flex items-start justify-between">
          {/* Top Left: Postage Stamp */}
          <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-emerald-800 bg-[#fbf3de] p-0.5 shadow-md">
            <div className="flex h-11 w-12 flex-col items-center justify-center rounded bg-[#0b2f1f] p-1 text-center font-mono text-[7px] font-extrabold text-[#ffd400]">
              <span>GOA</span>
              <span className="text-[6px] text-[#f2226b]">INDIA</span>
              <span className="text-[12px] leading-none">🌴</span>
            </div>
          </div>

          {/* Top Right: Circular Rubber Postmark Seal */}
          <div className="relative flex h-13 w-13 items-center justify-center rounded-full border-2 border-dashed border-[#0b2f1f] bg-[#fbf3de]/80 p-1 text-center font-mono text-[6px] font-extrabold text-[#0b2f1f] shadow-md">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
              <text fontSize="9" fontWeight="bold" fill="#0b2f1f">
                <textPath href="#circlePath" startOffset="0%">
                  BUILD IN GOA • SHIP FROM PARADISE •
                </textPath>
              </text>
            </svg>
            <span className="text-[11px] text-[#f2226b]">★</span>
          </div>
        </div>

        {/* Title Lockup: HACKER GOA HOUSE */}
        <div className="mt-1 flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#ffd400] bg-[#0b2f1f]/90 px-3.5 py-1 text-center shadow-lg backdrop-blur-md">
            <span className="font-[var(--font-display)] text-[clamp(14px,3.5vw,22px)] font-black tracking-wider text-[#ffd400]">
              HACKER
            </span>
            <span className="font-[var(--font-script)] text-[clamp(17px,4vw,26px)] font-bold text-[#f2226b]">
              गोवा
            </span>
            <span className="font-[var(--font-display)] text-[clamp(14px,3.5vw,22px)] font-black tracking-wider text-[#ffd400]">
              HOUSE
            </span>
          </div>
          <div className="mt-1 inline-block rounded-full bg-[#f2226b] px-2.5 py-0.5 font-mono text-[8px] font-black tracking-[0.16em] text-white shadow-sm">
            ✦ BUILD IN GOA, SHIP FROM PARADISE ✦
          </div>
        </div>
      </div>

      {/* Middle Section: Gen-Z Floating Signposts, Center Photo, & Starburst Badge */}
      <div className="relative z-10 my-1 flex items-center justify-between px-1">
        {/* Gen-Z Signpost Chips: COOK ⚡ SHIP 🚀 FLEX 💎 */}
        <div className="relative z-10 flex flex-col gap-0.5 font-mono text-[7px] font-black">
          <div className="rounded-r border border-[#0b2f1f] bg-[#ffd400] px-1.5 py-0.5 text-[#0b2f1f] shadow-md">COOK ⚡</div>
          <div className="rounded-r border border-white bg-[#f2226b] px-1.5 py-0.5 text-white shadow-md">SHIP 🚀</div>
          <div className="rounded-r border border-[#ffd400] bg-[#0b2f1f] px-1.5 py-0.5 text-[#ffd400] shadow-md">FLEX 💎</div>
        </div>

        {/* Center Photo Frame */}
        <div className="relative flex flex-col items-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#f2226b] p-1 shadow-2xl sm:h-32 sm:w-32" style={{ background: 'linear-gradient(135deg, #ffd400, #f2226b)' }}>
            <div className="h-full w-full overflow-hidden rounded-full bg-slate-200">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="h-full w-full object-cover transition-transform duration-75"
                  style={{
                    transform: `scale(${zoom}) translate(${(panX || 0) * 15}px, ${(panY || 0) * 15}px)`,
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#0b2f1f] text-3xl font-black text-[#ffd400]">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>
          {/* BUILDER Sticker Chip */}
          <div
            className="absolute -bottom-1 -left-2 rounded-full border border-white bg-[#f2226b] px-2 py-0.5 font-mono text-[8px] font-black tracking-wider text-white shadow-md"
            style={{ transform: 'rotate(-8deg)' }}
          >
            BUILDER
          </div>
        </div>

        {/* Right Starburst Sticker: LET'S BUILD! */}
        <div className="relative z-10 flex flex-col items-end">
          <div className="rotate-6 rounded-lg border border-[#0b2f1f] bg-[#ffd400] px-2 py-1 font-mono text-[8px] font-black text-[#0b2f1f] shadow-md">
            LET'S BUILD! ⚡
          </div>
        </div>
      </div>

      {/* Centered Name & Role Pills */}
      <div className="relative z-10 text-center">
        {/* Name Pill */}
        <div className="inline-flex max-w-[92%] truncate rounded-full border-2 border-[#ffd400] bg-[#0b2f1f] px-5 py-1 font-mono text-[clamp(13px,3.2vw,17px)] font-black tracking-wider text-white shadow-xl">
          ✦ {displayName} ✦
        </div>

        {/* Role Pill */}
        <div className="mt-1 flex justify-center">
          <div className="inline-flex max-w-[88%] truncate items-center gap-1 rounded-full border border-[#0b2f1f] bg-[#ffd400] px-3.5 py-0.5 font-mono text-[9px] font-extrabold tracking-widest text-[#0b2f1f] shadow-md">
            <span>⚡</span>
            <span className="truncate">{displayRole}</span>
            <span>⚡</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tropical Goa Ticket Pass Grid */}
      <div className="relative z-10 mt-1 rounded-2xl border-2 border-[#0b2f1f] bg-[#fbf3de] p-2 text-[#0b2f1f] shadow-xl">
        <div className="grid grid-cols-3 items-start gap-1 text-center font-mono text-[8px]">
          {/* Column 1: Builder Class & QR Code */}
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] font-extrabold text-[#0b2f1f]/75">
              ✦ BUILDER AURA ✦
            </span>
            <span className="w-full truncate font-black text-[#f2226b]">{displayClass}</span>
            <div className="mt-1 flex h-13 w-13 items-center justify-center rounded-md border border-[#0b2f1f] bg-white p-0.5 shadow-sm">
              {realQrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={realQrDataUrl} alt="QR Code" className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full bg-slate-100 animate-pulse" />
              )}
            </div>
            <span className="mt-0.5 text-[6.5px] font-black text-[#f2226b]">⚡ SCAN FOR ACCESS</span>
          </div>

          {/* Column 2: Beach Essentials */}
          <div className="flex flex-col items-center border-x border-[#0b2f1f]/20 px-1">
            <span className="text-[7.5px] font-extrabold text-[#0b2f1f]/75">
              ✦ GOA VIBES ✦
            </span>
            <div className="mt-1 flex flex-col gap-1 text-[8px] font-black text-[#0b2f1f]">
              <span className="flex items-center justify-center gap-0.5">🥥 COCONUT</span>
              <span className="flex items-center justify-center gap-0.5">💻 VS CODE</span>
              <span className="flex items-center justify-center gap-0.5">🎧 LO-FI VIBES</span>
            </div>
          </div>

          {/* Column 3: Shipping Status & Builder Pass ID */}
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] font-extrabold text-[#0b2f1f]/75">
              ✦ SHIPPING STATUS ✦
            </span>
            <span className="w-full truncate font-black text-[#f2226b]">BUILDING FUTURE</span>
            <div className="mt-1 flex flex-col items-center rounded-md bg-[#0b2f1f] px-2 py-0.5 text-[#fbf3de] shadow-sm">
              <span className="text-[6.5px] font-bold text-[#ffd400]">BUILDER ID</span>
              <span className="text-[10px] font-black text-white">{builderId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner: ✦ #FRAMEINGOA ✦ */}
      <div className="relative z-10 mt-1 flex h-6 items-center justify-center rounded-lg border border-white bg-[#f2226b] font-mono text-[9.5px] font-black tracking-widest text-white shadow-md">
        ✦ #FRAMEINGOA ✦
      </div>
    </div>
  );
}
