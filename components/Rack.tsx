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
      {/* Top Navbar Header */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <button onClick={onBack} className="flex items-center gap-2 font-[var(--font-mono)] text-[13px] font-bold text-[var(--cream)] hover:text-[var(--yellow)] transition-colors">
          ← BACK
        </button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-[12px] font-black leading-none text-[var(--yellow)]" style={{ fontFamily: 'var(--font-display)' }}>
            <span>HACKER</span>
            <span className="text-[10px] text-[var(--pink)]" style={{ fontFamily: 'var(--font-script)' }}>गोवा</span>
            <span>HOUSE</span>
          </div>
          <div className="h-5 w-[1px] bg-[var(--cream)]/20" />
          <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[.12em] text-[var(--yellow)]">
            {String(activeIdx + 1).padStart(2, '0')} / {String(EDITIONS_LIST.length).padStart(2, '0')} · {activeEdition.label}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 items-center">
        <button
          aria-label="Previous edition"
          onClick={() => step(-1)}
          disabled={activeIdx === 0}
          className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-[var(--cream)] transition-opacity disabled:opacity-0 sm:left-6"
          style={{ background: 'rgba(11,47,31,.75)', border: '1.5px solid rgba(251,243,222,.35)' }}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          aria-label="Next edition"
          onClick={() => step(1)}
          disabled={activeIdx === EDITIONS_LIST.length - 1}
          className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-[var(--cream)] transition-opacity disabled:opacity-0 sm:right-6"
          style={{ background: 'rgba(11,47,31,.75)', border: '1.5px solid rgba(251,243,222,.35)' }}
        >
          <ChevronRight size={24} />
        </button>

        <div
          ref={scrollerRef}
          className="scrollbar-none flex flex-1 items-center gap-8 overflow-x-auto px-[calc(50%-150px)] py-6 sm:px-[calc(50%-190px)]"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {EDITIONS_LIST.map((ed, i) => {
            const p = progress[i] ?? 0;
            const scale = 0.88 + 0.12 * p;
            const rotate = MICRO_ROT[i] * (1 - p);
            const opacity = 0.65 + 0.35 * p;
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
                className="w-[300px] flex-shrink-0 cursor-pointer sm:w-[350px] md:w-[380px]"
                style={{
                  scrollSnapAlign: 'center',
                  aspectRatio: '4 / 5',
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  opacity,
                  transition: 'transform .25s ease-out, opacity .25s ease-out',
                }}
              >
                <div
                  className="h-full w-full overflow-hidden rounded-2xl transition-all"
                  style={{
                    boxShadow: ed.id === selected ? '0 24px 60px rgba(0,0,0,.6), 0 0 20px rgba(255,212,0,.3)' : '0 16px 36px rgba(11,47,31,.4)',
                    border: ed.id === selected ? '2px solid rgba(255,212,0,.5)' : '1px solid rgba(251,243,222,.15)',
                  }}
                >
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
            className="h-2 w-8 rounded-full transition-colors"
            style={{ background: ed.id === selected ? 'var(--yellow)' : 'rgba(251,243,222,.25)' }}
          />
        ))}
      </div>

      <div className="px-6 pb-3 text-center font-[var(--font-mono)] text-[13px] tracking-[.06em] text-[var(--cream)] sm:px-10">
        <span className="font-bold text-[var(--yellow)]">{String(activeIdx + 1).padStart(2, '0')}</span> · {activeEdition.copy}
      </div>

      <div className="px-6 pb-10 sm:px-10">
        <button
          onClick={onIssue}
          className="mx-auto block min-h-[54px] w-full max-w-[360px] rounded-lg border-2 border-dashed px-8 py-4 font-[var(--font-mono)] text-[15px] font-extrabold tracking-[.1em] text-[var(--ink)] shadow-xl transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: 'var(--yellow)', borderColor: 'rgba(11,47,31,.6)' }}
        >
          ISSUE MY IDENTITY →
        </button>
      </div>
    </div>
  );
}
