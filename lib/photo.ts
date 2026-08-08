// Client-only photo pipeline: upload -> (HEIC decode) -> downscale -> cover-fit into aperture -> duotone.

import { drawHalftone } from './halftone';

export type ApertureShape = 'circle' | 'arch' | 'rounded' | 'square';

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Loads any user photo, transparently converting HEIC/HEIF (iPhone default) via a lazy import. */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;
  const looksHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  if (looksHeic) {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
      blob = Array.isArray(converted) ? converted[0] : (converted as Blob);
    } catch {
      // native <img> may still decode it on Safari — fall through
    }
  }
  const url = URL.createObjectURL(blob);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Could not read that photo — try a jpg or png.'));
    el.src = url;
  });
  return img;
}

/** Downscale to a sane working size before any pixel processing. */
export function downscale(img: HTMLImageElement, maxEdge = 2000): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return c;
}

export function orientationOf(canvas: HTMLCanvasElement): 'portrait' | 'landscape' | 'square' {
  const r = canvas.width / canvas.height;
  if (r > 1.15) return 'landscape';
  if (r < 0.87) return 'portrait';
  return 'square';
}

/** Shadows -> ink, highlights -> light, blended at `strength` so faces stay legible. */
export function applyDuotone(canvas: HTMLCanvasElement, shadow: string, highlight: string, strength = 0.82) {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const s = hexToRgb(shadow);
  const h = hexToRgb(highlight);
  for (let i = 0; i < d.length; i += 4) {
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    const r = s.r + (h.r - s.r) * lum;
    const g = s.g + (h.g - s.g) * lum;
    const b = s.b + (h.b - s.b) * lum;
    d[i] = d[i] * (1 - strength) + r * strength;
    d[i + 1] = d[i + 1] * (1 - strength) + g * strength;
    d[i + 2] = d[i + 2] * (1 - strength) + b * strength;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function apertureShapePath(ctx: CanvasRenderingContext2D, shape: ApertureShape, x: number, y: number, w: number, h: number, radius = 28) {
  if (shape === 'circle') {
    ctx.moveTo(x + w, y + h / 2);
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
  } else if (shape === 'arch') {
    const r = w / 2;
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  } else if (shape === 'rounded') {
    roundRectPath(ctx, x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
}

export interface DrawPhotoOpts {
  shape: ApertureShape;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  panX?: number; // -1..1
  panY?: number; // -1..1
  zoom?: number; // >=1
}

/** Cover-fits the source into the aperture, orientation-aware default framing, then clips. */
export function drawPhotoIntoAperture(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, opts: DrawPhotoOpts) {
  const { shape, x, y, w, h, radius = 28, panX = 0, panY = 0, zoom = 1 } = opts;
  const sw = source.width;
  const sh = source.height;

  ctx.save();
  ctx.beginPath();
  apertureShapePath(ctx, shape, x, y, w, h, radius);
  ctx.clip();

  const coverScale = Math.max(w / sw, h / sh) * zoom;
  const dw = sw * coverScale;
  const dh = sh * coverScale;
  const portrait = sh > sw * 1.05;
  const anchorY = portrait ? 0.3 : 0.5; // portraits frame upward for faces near the top third
  let dx = x + w / 2 - dw / 2;
  let dy = y + h * anchorY - dh * anchorY;
  dx += panX * Math.max(0, dw - w) * 0.5;
  dy += panY * Math.max(0, dh - h) * 0.5;
  ctx.drawImage(source, dx, dy, dw, dh);
  ctx.restore();
}

/** Halftone dot feather around the aperture edge — makes the photo read as printed, not pasted. */
export function drawApertureFeather(
  ctx: CanvasRenderingContext2D,
  shape: ApertureShape,
  x: number,
  y: number,
  w: number,
  h: number,
  colorFrom: string,
  colorTo: string,
  band = 20,
  radius = 28
) {
  ctx.save();
  ctx.beginPath();
  apertureShapePath(ctx, shape, x - band, y - band, w + band * 2, h + band * 2, radius + band);
  apertureShapePath(ctx, shape, x, y, w, h, radius);
  ctx.clip('evenodd');
  drawHalftone(ctx, {
    x: x - band,
    y: y - band,
    w: w + band * 2,
    h: h + band * 2,
    axis: 'radial',
    maxRadius: 3,
    minRadius: 0,
    grid: 8,
    jitter: 0.2,
    seed: 11,
    colorFrom,
    colorTo,
  });
  ctx.restore();
}
