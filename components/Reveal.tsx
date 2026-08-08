'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import CardCanvas from './CardCanvas';
import type { EditionConfig } from '@/lib/render/engine';
import type { Identity } from '@/lib/identity';

interface Props {
  edition: EditionConfig;
  photo: HTMLCanvasElement | null;
  name: string;
  stack: string;
  identity: Identity;
  onDone: () => void;
}

export default function Reveal({ edition, photo, name, stack, identity, onDone }: Props) {
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('PRINTING…');

  useEffect(() => {
    // The state transition is driven by this plain timer, not gsap's onComplete — gsap's rAF-based
    // ticker stalls while the tab is hidden/backgrounded, which must never wedge the app mid-reveal.
    const doneTimer = setTimeout(onDone, 1620);
    const tl = gsap.timeline();
    tl.set(cardWrapRef.current, { clipPath: 'inset(0% 0 100% 0)', opacity: 0, scale: 0.96 });
    tl.set(sealRef.current, { scale: 1.9, rotate: -32, opacity: 0 });
    tl.to(cardWrapRef.current, { opacity: 1, duration: 0.15 }, 0);
    tl.to(cardWrapRef.current, { clipPath: 'inset(0% 0 0% 0)', duration: 0.6, ease: 'power2.inOut' }, 0);
    tl.to(cardWrapRef.current, { scale: 1, duration: 0.6, ease: 'power2.out' }, 0);
    tl.call(() => setStatus('STAMPING…'), undefined, 0.55);
    tl.to(cardWrapRef.current, { x: -4, duration: 0.05 }, 0.58)
      .to(cardWrapRef.current, { x: 4, duration: 0.05 })
      .to(cardWrapRef.current, { x: -3, duration: 0.05 })
      .to(cardWrapRef.current, { x: 3, duration: 0.05 })
      .to(cardWrapRef.current, { x: 0, duration: 0.05 });
    tl.to(sealRef.current, { scale: 1, rotate: -10, opacity: 1, duration: 0.5, ease: 'back.out(1.9)' }, 0.58);
    tl.call(() => setStatus('ISSUED'), undefined, 1.05);
    return () => {
      tl.kill();
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-8 bg-[var(--green)] px-6">
      <div className="relative w-[300px] max-w-[80vw]" style={{ aspectRatio: '4 / 5' }}>
        <div
          ref={cardWrapRef}
          className="h-full w-full overflow-hidden rounded-2xl"
          style={{ boxShadow: '0 24px 48px rgba(11,47,31,.35)' }}
        >
          <CardCanvas edition={edition} photo={photo} name={name} stack={stack} identity={identity} className="h-full w-full" />
        </div>
        <div
          ref={sealRef}
          className="absolute -top-5 -right-5 flex h-20 w-20 items-center justify-center rounded-full text-center"
          style={{ background: 'var(--pink)', color: 'var(--cream)', boxShadow: '0 10px 24px rgba(0,0,0,.35)' }}
        >
          <span className="font-[var(--font-mono)] text-[9px] font-bold leading-tight">
            HH
            <br />
            GOA
          </span>
        </div>
      </div>
      <div className="font-[var(--font-mono)] text-[13px] tracking-[.16em] text-[var(--yellow)]">{status}</div>
    </div>
  );
}
