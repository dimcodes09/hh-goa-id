import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

function getBlobOptions() {
  const options: Record<string, unknown> = {
    access: 'public',
    contentType: 'image/png',
  };

  // 1. Check Store ID (for OIDC auth)
  if (process.env.BLOB_STORE_ID) {
    options.storeId = process.env.BLOB_STORE_ID;
  } else if (process.env.VERCEL_BLOB_STORE_ID) {
    options.storeId = process.env.VERCEL_BLOB_STORE_ID;
  } else {
    for (const [key, val] of Object.entries(process.env)) {
      if (val && typeof val === 'string' && key.endsWith('BLOB_STORE_ID')) {
        options.storeId = val.trim();
        break;
      }
    }
  }

  // 2. Check Token (for static token auth fallback if OIDC storeId not present)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    options.token = process.env.BLOB_READ_WRITE_TOKEN;
  } else {
    for (const [key, val] of Object.entries(process.env)) {
      if (val && typeof val === 'string' && (key.endsWith('READ_WRITE_TOKEN') || val.startsWith('vercel_blob_rw_'))) {
        options.token = val.trim();
        break;
      }
    }
  }

  return options;
}

// Hosts a generated card PNG so X's link-preview crawler has something to fetch —
// X's tweet-intent URL has no way to accept an image file directly, only a link.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'no file' }, { status: 400 });
    }

    const options = getBlobOptions();
    const blob = await put(`cards/${Date.now()}-${Math.random().toString(36).slice(2)}.png`, file, options as unknown as Parameters<typeof put>[2]);
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('Vercel Blob Upload error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'upload failed' }, { status: 500 });
  }
}
