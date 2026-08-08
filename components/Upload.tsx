'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

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
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[var(--green)]">
      <div className="pointer-events-none absolute -left-10 top-14 select-none font-[var(--font-mono)] text-[120px] font-bold text-[var(--cream)]/[0.04]">
        गोवा
      </div>

      <div className="relative z-10 flex items-center gap-4 px-6 py-5 sm:px-10">
        <button onClick={onBack} className="font-[var(--font-mono)] text-[13px] tracking-wide text-[var(--cream)]">
          ← BACK
        </button>
        <div className="font-[var(--font-mono)] text-[11px] tracking-[.12em] text-[var(--yellow)]">
          STEP 1/2 · PRESENT YOUR PHOTOGRAPH
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-10 sm:px-10">
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
            className="relative flex h-[min(78vw,300px)] w-[min(78vw,300px)] cursor-pointer items-center justify-center overflow-hidden rounded-[20px] border-[3px] border-dashed transition-transform"
            style={{
              background: 'var(--cream-shade)',
              borderColor: dragOver ? 'var(--pink)' : 'rgba(11,47,31,.4)',
              transform: dragOver ? 'scale(1.015)' : undefined,
            }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Your photo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-[var(--ink)]">
                <User size={56} strokeWidth={2.5} />
                <div className="text-center font-[var(--font-mono)] text-[11px] tracking-[.08em] opacity-70">
                  DROP YOUR FIT PIC HERE
                  <br />
                  or tap to browse
                </div>
              </div>
            )}
            {processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/60 font-[var(--font-mono)] text-[11px] tracking-[.1em] text-[var(--cream)]">
                DEVELOPING…
              </div>
            )}
            {(['top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl', 'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr', 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl', 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br'] as const).map((cls) => (
              <div key={cls} className={`pointer-events-none absolute m-[10px] h-4 w-4 border-[var(--pink)] ${cls}`} />
            ))}
          </div>
          <motion.div
            initial={{ rotate: 10 }}
            animate={{ rotate: [10, -4, 10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-6 -top-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed text-center shadow-lg"
            style={{ background: 'var(--cream)', borderColor: 'var(--pink)' }}
          >
            <span className="font-[var(--font-script)] text-[11px] font-bold leading-tight text-[var(--pink)]">
              no cap,
              <br />
              lock in
            </span>
          </motion.div>
        </div>

        {error && <div className="font-[var(--font-mono)] text-[12px] text-[var(--pink)]">{error}</div>}

        {previewUrl ? (
          <button onClick={() => inputRef.current?.click()} className="font-[var(--font-mono)] text-[12px] tracking-[.06em] text-[var(--teal)]">
            CHANGE PHOTO
          </button>
        ) : (
          <div className="font-[var(--font-mono)] text-[10px] tracking-[.08em] text-[var(--cream)]/45">
            JPG, PNG, WEBP OR HEIC · MAX 10MB
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

        <div className="flex w-[min(84vw,340px)] flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-[var(--font-mono)] text-[10px] tracking-[.14em] text-[var(--yellow)]/80">FULL NAME</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="e.g. SATOSHI NAKAMOTO"
              className="border-0 border-b-2 border-[var(--cream)]/35 bg-transparent py-2 font-[var(--font-mono)] text-[16px] uppercase tracking-[.06em] text-[var(--cream)] outline-none focus:border-[var(--yellow)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-[var(--font-mono)] text-[10px] tracking-[.14em] text-[var(--yellow)]/80">STACK / ROLE (OPTIONAL)</span>
            <input
              value={stack}
              onChange={(e) => setStack(e.target.value.slice(0, 24))}
              placeholder="e.g. FULL-STACK / RUST / AI"
              className="border-0 border-b-2 border-[var(--cream)]/35 bg-transparent py-2 font-[var(--font-mono)] text-[14px] uppercase tracking-[.06em] text-[var(--cream)] outline-none focus:border-[var(--yellow)]"
            />
          </label>
        </div>

        <button
          onClick={onNext}
          disabled={!previewUrl || processing}
          className="min-h-[52px] rounded border-2 border-dashed px-8 py-4 font-[var(--font-mono)] text-[14px] font-bold tracking-[.08em] text-[var(--ink)] transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.03]"
          style={{ background: 'var(--yellow)', borderColor: 'rgba(11,47,31,.5)' }}
        >
          CHOOSE EDITION →
        </button>
      </div>
    </div>
  );
}
