import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Hosts a generated card PNG so X's link-preview crawler has something to fetch —
// X's tweet-intent URL has no way to accept an image file directly, only a link.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'no file' }, { status: 400 });
    }
    const blob = await put(`cards/${Date.now()}-${Math.random().toString(36).slice(2)}.png`, file, {
      access: 'public',
      contentType: 'image/png',
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'upload failed' }, { status: 500 });
  }
}
