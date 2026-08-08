'use client';

import { useMemo } from 'react';
import type { EditionConfig } from '@/lib/render/engine';
import type { Identity } from '@/lib/identity';
import CardDisplay from './CardDisplay';

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
  const photoUrl = useMemo(() => {
    if (!photo) return null;
    try {
      return photo.toDataURL('image/png');
    } catch {
      return null;
    }
  }, [photo]);

  return (
    <CardDisplay
      editionId={edition.id}
      photoUrl={photoUrl}
      name={name}
      stack={stack}
      identity={identity}
      panX={panX}
      panY={panY}
      zoom={zoom}
      className={className}
    />
  );
}
