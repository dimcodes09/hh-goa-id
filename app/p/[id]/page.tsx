import type { Metadata } from 'next';

// The link X's tweet-intent points at. Its only job: give X's crawler an og:image that
// resolves to the hosted card PNG, so posting the link shows the card — no manual attach.
export async function generateMetadata(props: PageProps<'/p/[id]'>): Promise<Metadata> {
  const sp = await props.searchParams;
  const img = typeof sp.img === 'string' ? sp.img : '';
  const name = typeof sp.name === 'string' ? sp.name : 'a builder';
  const title = `${name}'s HH Goa 2026 builder card`;
  return {
    title,
    description: 'Stamped for HH Goa 2026. #FrameInGoa',
    openGraph: { title, images: img ? [img] : [], type: 'website' },
    twitter: { card: 'summary_large_image', title, images: img ? [img] : [] },
  };
}

export default async function SharedCardPage(props: PageProps<'/p/[id]'>) {
  const sp = await props.searchParams;
  const img = typeof sp.img === 'string' ? sp.img : '';
  const name = typeof sp.name === 'string' ? sp.name : 'a builder';

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-6 bg-[var(--green)] px-6 py-12 text-center">
      <div className="font-[var(--font-mono)] text-[12px] tracking-[.14em] text-[var(--yellow)]">HH GOA 2026 · STAMP OFFICE</div>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={`${name}'s builder card`} className="w-full max-w-[360px] rounded-2xl" style={{ boxShadow: '0 24px 48px rgba(11,47,31,.4)' }} />
      )}
      <a
        href="/"
        className="mt-2 rounded border-2 border-dashed px-8 py-4 font-[var(--font-mono)] text-[14px] font-bold tracking-[.08em] text-[var(--ink)]"
        style={{ background: 'var(--yellow)', borderColor: 'rgba(11,47,31,.5)' }}
      >
        GET STAMPED →
      </a>
    </div>
  );
}
