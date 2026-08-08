'use client';

import { useEffect, useMemo, useState } from 'react';
import Loader from '@/components/Loader';
import Landing from '@/components/Landing';
import Upload from '@/components/Upload';
import RackLoader from '@/components/RackLoader';
import Rack from '@/components/Rack';
import Reveal from '@/components/Reveal';
import Result from '@/components/Result';
import { loadImageFromFile, downscale, applyDuotone } from '@/lib/photo';
import { makeIdentity } from '@/lib/identity';
import { EDITIONS } from '@/lib/editions';
import { COLOR, type EditionId } from '@/lib/tokens';

type Step = 'loading' | 'landing' | 'upload' | 'transition' | 'rack' | 'reveal' | 'result';

function cloneCanvas(src: HTMLCanvasElement) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0);
  return c;
}

export default function Home() {
  const [step, setStep] = useState<Step>('loading');
  const [name, setName] = useState('');
  const [stack, setStack] = useState('');
  const [rawPhoto, setRawPhoto] = useState<HTMLCanvasElement | null>(null);
  const [duoPhoto, setDuoPhoto] = useState<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editionId, setEditionId] = useState<EditionId>('transit');
  const [reroll, setReroll] = useState(0);

  const identity = useMemo(() => makeIdentity(name, stack, reroll), [name, stack, reroll]);
  const edition = EDITIONS[editionId];

  const handleFile = async (file: File) => {
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImageFromFile(file);
      const canvas = downscale(img, 2000);
      const duo = cloneCanvas(canvas);
      applyDuotone(duo, COLOR.ink, COLOR.lime, 0.82);
      setRawPhoto(canvas);
      setDuoPhoto(duo);
      setPreviewUrl(duo.toDataURL());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that photo — try a jpg or png.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {step === 'loading' && <Loader onDone={() => setStep('landing')} />}

      {step === 'landing' && <Landing onStart={() => setStep('upload')} />}

      {step === 'upload' && (
        <Upload
          previewUrl={previewUrl}
          processing={processing}
          error={error}
          onFile={handleFile}
          name={name}
          setName={setName}
          stack={stack}
          setStack={setStack}
          onBack={() => setStep('landing')}
          onNext={() => setStep('transition')}
        />
      )}

      {step === 'transition' && <RackLoader onDone={() => setStep('rack')} />}

      {step === 'rack' && (
        <Rack
          photo={duoPhoto}
          name={name}
          stack={stack}
          identity={identity}
          selected={editionId}
          onSelect={setEditionId}
          onBack={() => setStep('upload')}
          onIssue={() => setStep('reveal')}
        />
      )}

      {step === 'reveal' && (
        <Reveal
          edition={edition}
          photo={duoPhoto}
          name={name}
          stack={stack}
          identity={identity}
          onDone={() => setStep('result')}
        />
      )}

      {step === 'result' && (
        <Result
          edition={edition}
          rawPhoto={rawPhoto}
          duoPhoto={duoPhoto}
          name={name}
          stack={stack}
          identity={identity}
          onSwitchEdition={() => setStep('rack')}
          onRegenerate={() => setReroll((r) => r + 1)}
          onBack={() => setStep('rack')}
        />
      )}
    </>
  );
}
