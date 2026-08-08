'use client';

import { useEffect, useRef } from 'react';
import { renderCard, type EditionConfig } from '@/lib/render/engine';
import type { Identity } from '@/lib/identity';

interface Props {
  edition: EditionConfig;
  photo: HTMLCanvasElement | null;
  name: string;
  stack: string;
  identity: Identity;
  panX?: number;
  panY?: number;
  zoom?: number;
  className?: string;
}

export default function CardCanvas({ edition, photo, name, stack, identity, panX = 0, panY = 0, zoom = 1, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    renderCard(ref.current, edition, { photo, name, stack, identity, pan: { x: panX, y: panY }, zoom }, 2);
  }, [edition, photo, name, stack, identity, panX, panY, zoom]);

  return <canvas ref={ref} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
