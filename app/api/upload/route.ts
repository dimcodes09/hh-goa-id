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

  // 2. Check Token (for static token auth fallback)
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
  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get('file');
    if (f instanceof File) {
      file = f;
    }
  } catch (e) {
    console.error('Failed to parse form data:', e);
  }

  if (!file) {
    return NextResponse.json({ error: 'no file' }, { status: 400 });
  }

  // Try Vercel Blob Put
  try {
    const options = getBlobOptions();
    const blob = await put(`cards/${Date.now()}-${Math.random().toString(36).slice(2)}.png`, file, options as unknown as Parameters<typeof put>[2]);
    return NextResponse.json({ url: blob.url });
  } catch (blobErr) {
    console.warn('Vercel Blob put failed, converting to data URL fallback:', blobErr);
    
    // Fallback: Return Data URL so local dev or unconfigured Blob environment still works seamlessly
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type || 'image/png'};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    } catch {
      return NextResponse.json({ error: blobErr instanceof Error ? blobErr.message : 'upload failed' }, { status: 500 });
    }
  }
}
