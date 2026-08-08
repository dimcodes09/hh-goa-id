import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || `cards/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

  try {
    const blob = await put(filename, request.body!, {
      access: 'public',
    });
    return NextResponse.json(blob);
  } catch (e) {
    console.warn('Vercel Blob put fallback:', e);
    try {
      const buffer = Buffer.from(await request.arrayBuffer());
      const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
      return NextResponse.json({ url: dataUrl });
    } catch {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'upload failed' }, { status: 500 });
    }
  }
}
