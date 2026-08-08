'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, Share2, RefreshCw, LayoutGrid, Move, Palette, type LucideIcon } from 'lucide-react';
import CardCanvas from './CardCanvas';
import { renderCard, renderPFP, type EditionConfig } from '@/lib/render/engine';
import { EVENT } from '@/lib/tokens';
import type { Identity } from '@/lib/identity';

interface Props {
  edition: EditionConfig;
  rawPhoto: HTMLCanvasElement | null;
  duoPhoto: HTMLCanvasElement | null;
  name: string;
  stack: string;
  identity: Identity;
  onSwitchEdition: () => void;
  onRegenerate: () => void;
  onBack: () => void;
}

function slug(s: string) {
  return (s.trim() || 'builder').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
}

export default function Result({ edition, rawPhoto, duoPhoto, name, stack, identity, onSwitchEdition, onRegenerate, onBack }: Props) {
  const [fullColor, setFullColor] = useState(false);
  const [reposition, setReposition] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);

  const photo = fullColor ? rawPhoto : duoPhoto;

  const buildBlob = useCallback(async () => {
    const c = document.createElement('canvas');
    renderCard(c, edition, { photo, name, stack, identity, pan, zoom }, 2);
    return new Promise<Blob>((resolve) => c.toBlob((b) => resolve(b as Blob), 'image/png'));
  }, [edition, photo, name, stack, identity, pan, zoom]);

  const download = async () => {
    setBusy('download');
    const blob = await buildBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hh-goa-2026-${edition.id}-${slug(name)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setBusy(null);
  };

  const downloadPFP = async () => {
    const c = document.createElement('canvas');
    renderPFP(c, { photo, name, stack, identity, pan, zoom }, 2);
    const blob: Blob = await new Promise((resolve) => c.toBlob((b) => resolve(b as Blob), 'image/png'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hh-goa-2026-pfp-${slug(name)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const share = async () => {
    setBusy('share');
    const caption = `Just got stamped for HH Goa 2026 ${EVENT.hashtag}`;
    // open the tab synchronously, in direct response to the click — opening it after an await
    // gets silently popup-blocked in most browsers, which is why "share" used to feel broken.
    const xTab = window.open('about:blank', '_blank');
    const blob = await buildBlob();

    // mobile: native share sheet attaches the image directly, no download/upload needed at all
    try {
      const file = new File([blob], `hh-goa-2026-${edition.id}.png`, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        xTab?.close();
        await navigator.share({ files: [file], text: caption });
        setBusy(null);
        return;
      }
    } catch {
      // user cancelled, or the platform refused — fall through to the link path below
    }

    // desktop: X's tweet-intent URL has no way to attach a file, only a link. So host the PNG
    // and hand X a link whose og:image *is* the card — the tweet preview shows it automatically,
    // no manual download/attach step for the user.
    try {
      const form = new FormData();
      form.append('file', blob, `hh-goa-2026-${edition.id}.png`);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('upload failed');
      const { url: hostedUrl } = (await res.json()) as { url: string };
      const pageUrl = `${window.location.origin}/p/${identity.builderId.replace(/[^a-zA-Z0-9]/g, '')}?img=${encodeURIComponent(hostedUrl)}&name=${encodeURIComponent(name || 'a builder')}`;
      const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(pageUrl)}`;
      if (xTab) xTab.location.href = intentUrl;
      else window.open(intentUrl, '_blank', 'noopener');
    } catch {
      // hosting unavailable (e.g. Vercel Blob not connected on this deployment yet) — fall back
      // to a text-only tweet plus a local download so the user can still attach it by hand.
      const caption2 = `${caption} (image attached below — drag it into the tweet)`;
      const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(caption2)}`;
      if (xTab) xTab.location.href = intentUrl;
      else window.open(intentUrl, '_blank', 'noopener');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hh-goa-2026-${edition.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
    setBusy(null);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!reposition) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!reposition || !dragState.current) return;
    const dx = (e.clientX - dragState.current.startX) / 140;
    const dy = (e.clientY - dragState.current.startY) / 140;
    setPan({
      x: Math.max(-1, Math.min(1, dragState.current.panX - dx)),
      y: Math.max(-1, Math.min(1, dragState.current.panY - dy)),
    });
  };
  const onPointerUp = () => {
    dragState.current = null;
  };

  return (
    <div className="flex min-h-[100svh] flex-col items-center bg-[var(--green)] px-6 pb-10 pt-6 sm:px-10">
      <div className="mb-6 flex w-full max-w-[420px] items-center justify-between">
        <button onClick={onBack} className="font-[var(--font-mono)] text-[13px] text-[var(--cream)]">
          ← BACK
        </button>
        <div className="font-[var(--font-mono)] text-[11px] tracking-[.12em] text-[var(--pink)]">ISSUED · {identity.builderId}</div>
      </div>

      <div
        className="relative w-full max-w-[340px] touch-none select-none"
        style={{ aspectRatio: '4 / 5', cursor: reposition ? 'grab' : 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="h-full w-full overflow-hidden rounded-2xl" style={{ boxShadow: '0 24px 48px rgba(11,47,31,.35)' }}>
          <CardCanvas
            edition={edition}
            photo={photo}
            name={name}
            stack={stack}
            identity={identity}
            panX={pan.x}
            panY={pan.y}
            zoom={zoom}
            className="h-full w-full"
          />
        </div>
        {reposition && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--pink)' }} />
        )}
      </div>

      {reposition && (
        <div className="mt-4 flex w-full max-w-[340px] items-center gap-3">
          <span className="font-[var(--font-mono)] text-[11px] text-[var(--cream)]/70">ZOOM</span>
          <input
            type="range"
            min={1}
            max={2}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-[var(--yellow)]"
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <AdjustButton icon={RefreshCw} label="REGENERATE" onClick={onRegenerate} />
        <AdjustButton icon={LayoutGrid} label="SWITCH EDITION" onClick={onSwitchEdition} />
        <AdjustButton icon={Move} label="REPOSITION" onClick={() => setReposition((v) => !v)} active={reposition} />
        <AdjustButton icon={Palette} label={fullColor ? 'COLOUR: FULL' : 'COLOUR: DUOTONE'} onClick={() => setFullColor((v) => !v)} active={fullColor} />
      </div>

      <div className="mt-6 flex w-full max-w-[420px] gap-3">
        <button
          onClick={download}
          disabled={busy !== null}
          className="flex-1 rounded border-2 border-dashed py-4 font-[var(--font-mono)] text-[13px] font-bold tracking-[.05em] text-[var(--ink)] disabled:opacity-50"
          style={{ background: 'var(--yellow)', borderColor: 'rgba(11,47,31,.5)' }}
        >
          <span className="inline-flex items-center gap-2">
            <Download size={16} /> DOWNLOAD PNG
          </span>
        </button>
        <button
          onClick={share}
          disabled={busy !== null}
          className="flex-1 rounded py-4 font-[var(--font-mono)] text-[13px] font-bold tracking-[.05em] text-[var(--cream)] disabled:opacity-50"
          style={{ background: 'var(--pink)' }}
        >
          <span className="inline-flex items-center gap-2">
            <Share2 size={16} /> SHARE TO X
          </span>
        </button>
      </div>

      <button onClick={downloadPFP} className="mt-4 font-[var(--font-mono)] text-[12px] tracking-[.06em] text-[var(--teal)]">
        also get the square PFP frame ↓
      </button>
    </div>
  );
}

function AdjustButton({ icon: Icon, label, onClick, active }: { icon: LucideIcon; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border px-4 py-2 font-[var(--font-mono)] text-[11px] tracking-[.05em] transition-colors"
      style={{
        borderColor: active ? 'var(--yellow)' : 'rgba(251,243,222,.3)',
        color: active ? 'var(--yellow)' : 'var(--cream)',
        background: active ? 'rgba(255,212,0,.08)' : 'transparent',
      }}
    >
      <Icon size={13} /> {label}
    </button>
  );
}
