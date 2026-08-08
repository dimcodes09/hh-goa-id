import { COLOR, FONT, CARD_W, CARD_H, SAFE_MARGIN, PFP_SIZE, type EditionId, type Stock } from '../tokens';
import { drawPhotoIntoAperture, drawApertureFeather, type ApertureShape } from '../photo';
import { drawSealRing, drawPerforatedFrame, drawBarcode, drawQRMark } from '../illustrations';
import type { Identity } from '../identity';

export interface Aperture {
  shape: ApertureShape;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
}

export interface RenderData {
  photo: HTMLCanvasElement | null;
  name: string;
  stack: string;
  identity: Identity;
  pan: { x: number; y: number };
  zoom: number;
}

export interface RenderContext extends RenderData {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
}

export interface EditionConfig {
  id: EditionId;
  label: string;
  copy: string; // one-line rack caption, mono voice
  stock: Stock;
  swatchBg: string;
  swatchFg: string;
  aperture: Aperture;
  draw: (rc: RenderContext) => void;
}

const displayName = (name: string) => (name.trim() ? name.trim().toUpperCase() : 'BUILDER');
const displayStack = (stack: string) => (stack.trim() ? stack.trim().toUpperCase() : 'FULL-STACK · CURIOUS');

export { displayName, displayStack };

/** The single trick that makes flat canvas type read as printed: fill twice, offset in yellowDeep. */
export function offsetText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { font: string; size: number; weight?: string; color: string; shadow?: string; offset?: number; align?: CanvasTextAlign; letterSpacing?: number }
) {
  const { font, size, weight = '900', color, shadow = COLOR.yellowDeep, offset = 6, align = 'left' } = opts;
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = shadow;
  ctx.fillText(text, x + offset, y + offset);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function monoText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { size: number; color: string; align?: CanvasTextAlign; weight?: string; tracking?: number }
) {
  const { size, color, align = 'left', weight = '700', tracking = 0 } = opts;
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${weight} ${size}px ${FONT.mono}`;
  ctx.fillStyle = color;
  if (tracking > 0 && align === 'left') {
    let cx = x;
    for (const ch of text) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + tracking;
    }
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

/** गोवा — exactly once per card, Kalam, pink, always a touch of overshoot rotation. */
export function govaMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot = -6, align: CanvasTextAlign = 'left') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.textAlign = align;
  ctx.font = `700 ${size}px ${FONT.script}`;
  ctx.fillStyle = COLOR.pink;
  ctx.fillText('गोवा', 0, 0);
  ctx.restore();
}

/** A small rotated sticker-style callout chip — the "LET'S BUILD!" / "GOA, IN" kind of detail. */
export function chip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
  opts: { bg: string; fg: string; rot?: number; size?: number; padX?: number; padY?: number }
) {
  const { bg, fg, rot = -6, size = 14, padX = 14, padY = 8 } = opts;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.font = `700 ${size}px ${FONT.mono}`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2;
  const h = size + padY * 2;
  ctx.fillStyle = bg;
  roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.25);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fg;
  ctx.fillText(text, 0, h * 0.04);
  ctx.restore();
}

/** The pink circular seal — rotated, deliberately overlapping something. */
export function pinkSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot: number, lines: string[]) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = COLOR.pink;
  ctx.fill();
  drawSealRing(ctx, 0, 0, r * 0.86, COLOR.cream);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR.cream;
  const lh = r * 0.26;
  const startY = -((lines.length - 1) * lh) / 2 + r * 0.08;
  lines.forEach((line, i) => {
    ctx.font = `700 ${r * 0.24}px ${FONT.mono}`;
    ctx.fillText(line, 0, startY + i * lh);
  });
  ctx.restore();
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function placePhoto(rc: RenderContext, ap: Aperture, shadowColor: string, lightColor: string, keyline?: string) {
  const { ctx, photo, pan, zoom } = rc;
  const x = ap.x * rc.w;
  const y = ap.y * rc.h;
  const w = ap.w * rc.w;
  const h = ap.h * rc.h;
  const radius = (ap.radius ?? 0.03) * rc.w;
  if (photo) {
    drawPhotoIntoAperture(ctx, photo, { shape: ap.shape, x, y, w, h, radius, panX: pan.x, panY: pan.y, zoom });
    drawApertureFeather(ctx, ap.shape, x, y, w, h, shadowColor, lightColor, Math.max(14, w * 0.03), radius);
  } else {
    ctx.save();
    ctx.beginPath();
    if (ap.shape === 'circle') ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    else roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.fill();
    ctx.restore();
  }
  if (keyline) {
    ctx.save();
    ctx.beginPath();
    if (ap.shape === 'circle') ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    else roundRect(ctx, x, y, w, h, radius);
    ctx.lineWidth = rc.w * 0.006;
    ctx.strokeStyle = keyline;
    ctx.stroke();
    ctx.restore();
  }
}

export function barcodeRow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, id: string, ink: string) {
  drawBarcode(ctx, x, y, w, h, id, ink);
}

export function qrMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, id: string, ink: string) {
  drawQRMark(ctx, x, y, size, id, ink);
}

export function frame(ctx: CanvasRenderingContext2D, w: number, h: number, ink: string) {
  drawPerforatedFrame(ctx, SAFE_MARGIN * 0.5, SAFE_MARGIN * 0.5, w - SAFE_MARGIN, h - SAFE_MARGIN, ink, w * 0.02, w * 0.0035);
}

export function renderCard(canvas: HTMLCanvasElement, edition: EditionConfig, data: RenderData, dpr = 2) {
  canvas.width = CARD_W * dpr;
  canvas.height = CARD_H * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  edition.draw({ ctx, w: CARD_W, h: CARD_H, ...data });
}

export function renderPFP(canvas: HTMLCanvasElement, data: RenderData, dpr = 2) {
  const S = PFP_SIZE;
  canvas.width = S * dpr;
  canvas.height = S * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = COLOR.green;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.fill();

  const ringR = S * 0.47;
  const photoR = S * 0.38;
  if (data.photo) {
    drawPhotoIntoAperture(ctx, data.photo, { shape: 'circle', x: S / 2 - photoR, y: S / 2 - photoR, w: photoR * 2, h: photoR * 2, panX: data.pan.x, panY: data.pan.y, zoom: data.zoom });
    drawApertureFeather(ctx, 'circle', S / 2 - photoR, S / 2 - photoR, photoR * 2, photoR * 2, COLOR.ink, COLOR.yellow, S * 0.02);
  }
  ctx.lineWidth = S * 0.05;
  ctx.strokeStyle = COLOR.yellow;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = S * 0.012;
  ctx.strokeStyle = COLOR.ink;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, ringR - S * 0.03, 0, Math.PI * 2);
  ctx.stroke();

  // "HH GOA 2026" set on the upper arc
  const text = 'HH GOA 2026 · HH GOA 2026 · ';
  const arcR = ringR + S * 0.02;
  ctx.font = `700 ${S * 0.032}px ${FONT.mono}`;
  ctx.fillStyle = COLOR.ink;
  let angle = -Math.PI / 2 - (text.length * 0.052) / 2;
  for (const ch of text) {
    const chW = ctx.measureText(ch).width;
    const a = angle + (chW / 2 / arcR);
    ctx.save();
    ctx.translate(S / 2 + Math.cos(a) * arcR, S / 2 + Math.sin(a) * arcR);
    ctx.rotate(a + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += chW / arcR + 0.012;
  }
  govaMark(ctx, S / 2, S * 0.9, S * 0.09, -5, 'center');
}
