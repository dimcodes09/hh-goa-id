'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CardCanvas from './CardCanvas';
import { EDITIONS_LIST } from '@/lib/editions';
import type { Identity } from '@/lib/identity';
import type { EditionId } from '@/lib/tokens';

interface Props {
  photo: HTMLCanvasElement | null;
  name: string;
  stack: string;
  identity: Identity;
  selected: EditionId;
  onSelect: (id: EditionId) => void;
  onBack: () => void;
  onIssue: () => void;
}

const MICRO_ROT = [-2.2, 1.6, -1.2, 2];

export default function Rack({ photo, name, stack, identity, selected, onSelect, onBack, onIssue }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progress, setProgress] = useState<number[]>(EDITIONS_LIST.map((e) => (e.id === selected ? 1 : 0)));

  const updateTransforms = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    const next = EDITIONS_LIST.map((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return 0;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center) / scroller.clientWidth;
      return Math.max(0, 1 - dist * 1.5);
    });
    setProgress(next);
  };

  const scrollToIndex = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const activeIdx = EDITIONS_LIST.findIndex((e) => e.id === selected);
  const activeEdition = EDITIONS_LIST[activeIdx];

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(EDITIONS_LIST.length - 1, i));
    onSelect(EDITIONS_LIST[clamped].id);
    scrollToIndex(clamped);
  };
  const step = (delta: number) => goTo(activeIdx + delta);

  useEffect(() => {
    updateTransforms();
    const idx = EDITIONS_LIST.findIndex((e) => e.id === selected);
    if (idx >= 0) requestAnimationFrame(() => scrollToIndex(idx));
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateTransforms);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // separate effect (re-armed whenever the active card changes) so arrow keys always step from "here"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  return (
    <div className="flex min-h-[100svh] flex-col bg-[var(--green)]">
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <button onClick={onBack} className="font-[var(--font-mono)] text-[13px] text-[var(--cream)]">
          ← BACK
        </button>
        <div className="font-[var(--font-mono)] text-[11px] tracking-[.12em] text-[var(--yellow)]">
          {String(activeIdx + 1).padStart(2, '0')} / {String(EDITIONS_LIST.length).padStart(2, '0')} · {activeEdition.label}
        </div>
      </div>

      <div className="relative flex flex-1 items-center">
        <button
          aria-label="Previous edition"
          onClick={() => step(-1)}
          disabled={activeIdx === 0}
          className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--cream)] transition-opacity disabled:opacity-0 sm:left-6"
          style={{ background: 'rgba(11,47,31,.55)', border: '1px solid rgba(251,243,222,.25)' }}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          aria-label="Next edition"
          onClick={() => step(1)}
          disabled={activeIdx === EDITIONS_LIST.length - 1}
          className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--cream)] transition-opacity disabled:opacity-0 sm:right-6"
          style={{ background: 'rgba(11,47,31,.55)', border: '1px solid rgba(251,243,222,.25)' }}
        >
          <ChevronRight size={22} />
        </button>

      <div
        ref={scrollerRef}
        className="scrollbar-none flex flex-1 items-center gap-6 overflow-x-auto px-[calc(50%-140px)] py-6"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {EDITIONS_LIST.map((ed, i) => {
          const p = progress[i] ?? 0;
          const scale = 0.86 + 0.14 * p;
          const rotate = MICRO_ROT[i] * (1 - p);
          const opacity = 0.62 + 0.38 * p;
          return (
            <div
              key={ed.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => {
                onSelect(ed.id);
                scrollToIndex(i);
              }}
              className="w-[260px] flex-shrink-0 cursor-pointer sm:w-[280px]"
              style={{
                scrollSnapAlign: 'center',
                aspectRatio: '4 / 5',
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                opacity,
                transition: 'opacity .25s',
              }}
            >
              <div className="h-full w-full overflow-hidden rounded-2xl" style={{ boxShadow: '0 24px 48px rgba(11,47,31,.35)' }}>
                <CardCanvas edition={ed} photo={photo} name={name} stack={stack} identity={identity} className="h-full w-full" />
              </div>
            </div>
          );
        })}
      </div>
      </div>

      <div className="flex justify-center gap-2 pb-3">
        {EDITIONS_LIST.map((ed, i) => (
          <button
            key={ed.id}
            aria-label={`Select ${ed.label}`}
            onClick={() => {
              onSelect(ed.id);
              scrollToIndex(i);
            }}
            className="h-1.5 w-6 rounded-full transition-colors"
            style={{ background: ed.id === selected ? 'var(--yellow)' : 'rgba(251,243,222,.25)' }}
          />
        ))}
      </div>

      <div className="px-6 pb-3 text-center font-[var(--font-mono)] text-[12px] tracking-[.04em] text-[var(--cream)]/80 sm:px-10">
        {String(activeIdx + 1).padStart(2, '0')} · {activeEdition.copy}
      </div>

      <div className="px-6 pb-10 sm:px-10">
        <button
          onClick={onIssue}
          className="mx-auto block min-h-[52px] w-full max-w-[340px] rounded border-2 border-dashed px-8 py-4 font-[var(--font-mono)] text-[14px] font-bold tracking-[.08em] text-[var(--ink)] transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--yellow)', borderColor: 'rgba(11,47,31,.5)' }}
        >
          ISSUE MY IDENTITY
        </button>
      </div>
    </div>
  );
}
