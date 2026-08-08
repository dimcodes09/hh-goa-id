import { COLOR, FONT, CARD_W, CARD_H, SAFE_MARGIN, PFP_SIZE, type EditionId, type Stock } from '../tokens';
import { drawPhotoIntoAperture, drawApertureFeather, type ApertureShape } from '../photo';
import { drawSealRing, drawPerforatedFrame, drawBarcode, drawQRMark, drawSunRays, drawPalmCluster, drawGoaBeachScenery } from '../illustrations';
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

import { GOA_BG_DATA_URL, GOA_DUSK_BG_DATA_URL } from '../bgImages';

let cachedBgImg: HTMLImageElement | null = null;
let cachedDuskBgImg: HTMLImageElement | null = null;

if (typeof window !== 'undefined') {
  cachedBgImg = new Image();
  cachedBgImg.src = GOA_BG_DATA_URL;

  cachedDuskBgImg = new Image();
  cachedDuskBgImg.src = GOA_DUSK_BG_DATA_URL;
}

export function drawModernCard(rc: RenderContext, editionId: EditionId) {
  const { ctx, w, h, photo, name, stack, identity, pan, zoom } = rc;

  const isSundown = editionId === 'sundown';
  const isTransit = editionId === 'transit';
  const isPostcard = editionId === 'postcard';

  const bgColor = isSundown ? '#0d3824' : isTransit ? '#07291a' : isPostcard ? '#faf3df' : '#fbf3de';
  const borderColor = isSundown ? '#ffd400' : isTransit ? '#a3e635' : '#0b2f1f';
  const textColor = isSundown || isTransit ? '#fbf3de' : '#0b2f1f';

  // Background Fill & Rounded Border
  ctx.save();
  roundRect(ctx, 0, 0, w, h, 40);
  ctx.clip();

  // Draw Full Custom Goa Tropical Background Image
  const bgImg = isSundown || isTransit ? cachedDuskBgImg : cachedBgImg;
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, w, h);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  // Draw Translucent Overlay Tint for Text Legibility
  ctx.fillStyle = isSundown
    ? 'rgba(5,31,19,0.55)'
    : isTransit
    ? 'rgba(3,20,12,0.6)'
    : 'rgba(251,243,222,0.4)';
  ctx.fillRect(0, 0, w, h);

  // Outer Border
  ctx.lineWidth = 12;
  ctx.strokeStyle = borderColor;
  roundRect(ctx, 6, 6, w - 12, h - 12, 34);
  ctx.stroke();

  // Airmail Dashed Inner Border for Postcard
  if (isPostcard) {
    ctx.save();
    ctx.setLineDash([12, 12]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(11,47,31,0.3)';
    roundRect(ctx, 24, 24, w - 48, h - 48, 24);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Top Lanyard Clip & Badge
  ctx.fillStyle = '#18181b';
  roundRect(ctx, w / 2 - 80, 0, 160, 32, 8);
  ctx.fill();

  roundRect(ctx, w / 2 - 140, 24, 280, 48, 12);
  ctx.fillStyle = '#f2226b';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ec4899';
  ctx.stroke();

  monoText(ctx, 'HH GOA 2026', w / 2, 54, { size: 20, color: '#ffffff', align: 'center', weight: '900', tracking: 4 });

  // 3. Top Left Postage Stamp
  const stampX = 80;
  const stampY = 90;
  ctx.save();
  ctx.fillStyle = '#fbf3de';
  ctx.strokeStyle = '#065f46';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  roundRect(ctx, stampX, stampY, 130, 150, 12);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  roundRect(ctx, stampX + 10, stampY + 10, 110, 130, 8);
  ctx.fillStyle = '#0b2f1f';
  ctx.fill();

  monoText(ctx, 'GOA', stampX + 65, stampY + 44, { size: 20, color: '#ffd400', align: 'center', weight: '900' });
  monoText(ctx, 'INDIA', stampX + 65, stampY + 74, { size: 16, color: '#f2226b', align: 'center', weight: '900' });
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌴', stampX + 65, stampY + 118);

  // 4. Top Right Circular Postmark Seal
  const sealX = 1420;
  const sealY = 160;
  const sealR = 70;
  ctx.save();
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = isSundown || isTransit ? 'rgba(255,212,0,0.6)' : 'rgba(11,47,31,0.5)';
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  monoText(ctx, '★', sealX, sealY + 10, { size: 36, color: borderColor, align: 'center' });

  // 5. Main Title Banner: HACKER GOA HOUSE
  const titleY = 260;
  ctx.save();
  ctx.font = `900 52px ${FONT.display}`;
  ctx.fillStyle = borderColor;
  ctx.textAlign = 'right';
  ctx.fillText('HACKER', w * 0.5 - 65, titleY);
  ctx.textAlign = 'left';
  ctx.fillText('HOUSE', w * 0.5 + 65, titleY);
  govaMark(ctx, w * 0.5, titleY + 2, 54, -6, 'center');

  monoText(ctx, '✦ BUILD IN GOA, SHIP FROM PARADISE ✦', w * 0.5, titleY + 42, {
    size: 18,
    color: '#f2226b',
    align: 'center',
    weight: '700',
    tracking: 3,
  });
  ctx.restore();

  // 6. Left Beach Artwork: Gen-Z Signpost Chips
  chip(ctx, 150, 480, 'COOK ⚡', { bg: '#ffd400', fg: '#0b2f1f', rot: 0, size: 18, padX: 16 });
  chip(ctx, 150, 540, 'SHIP 🚀', { bg: '#f2226b', fg: '#ffffff', rot: 0, size: 18, padX: 16 });
  chip(ctx, 150, 600, 'FLEX 💎', { bg: '#0b2f1f', fg: '#ffd400', rot: 0, size: 18, padX: 16 });

  // Right Starburst Sticker: LET'S BUILD!
  chip(ctx, 1420, 480, "LET'S BUILD! ⚡", { bg: '#ffd400', fg: '#0b2f1f', rot: 6, size: 18, padX: 16 });

  // 7. Center Photo Aperture
  const apCx = 800;
  const apCy = 650;
  const apR = 210;

  // Photo Gradient Outer Border
  ctx.save();
  const gradPhoto = ctx.createLinearGradient(apCx - apR, apCy - apR, apCx + apR, apCy + apR);
  gradPhoto.addColorStop(0, '#ffd400');
  gradPhoto.addColorStop(1, '#f2226b');
  ctx.fillStyle = gradPhoto;
  ctx.beginPath();
  ctx.arc(apCx, apCy, apR + 16, 0, Math.PI * 2);
  ctx.fill();

  // Inner Photo Clip
  ctx.beginPath();
  ctx.arc(apCx, apCy, apR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(apCx - apR, apCy - apR, apR * 2, apR * 2);

  if (photo) {
    drawPhotoIntoAperture(ctx, photo, {
      shape: 'circle',
      x: apCx - apR,
      y: apCy - apR,
      w: apR * 2,
      h: apR * 2,
      panX: pan.x,
      panY: pan.y,
      zoom,
    });
  } else {
    monoText(ctx, displayName(name).charAt(0), apCx, apCy + 20, { size: 90, color: '#0b2f1f', align: 'center', weight: '900' });
  }
  ctx.restore();

  // BUILDER Sticker Chip
  chip(ctx, apCx - 140, apCy + apR + 10, 'BUILDER', {
    bg: '#f2226b',
    fg: '#ffffff',
    rot: -8,
    size: 22,
    padX: 24,
    padY: 10,
  });

  // 8. Centered Name & Role Pills
  const nameY = 960;
  // Name Pill Box
  ctx.save();
  ctx.font = `900 36px ${FONT.mono}`;
  const nameW = ctx.measureText(`✦ ${displayName(name)} ✦`).width + 60;
  ctx.fillStyle = '#0b2f1f';
  roundRect(ctx, w / 2 - nameW / 2, nameY, nameW, 64, 32);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd400';
  ctx.stroke();

  monoText(ctx, `✦ ${displayName(name)} ✦`, w / 2, nameY + 44, { size: 36, color: '#ffffff', align: 'center', weight: '900', tracking: 2 });

  // Role Pill Box
  const roleY = nameY + 84;
  ctx.font = `900 22px ${FONT.mono}`;
  const roleW = ctx.measureText(`⚡ ${displayStack(stack)} ⚡`).width + 40;
  ctx.fillStyle = '#ffd400';
  roundRect(ctx, w / 2 - roleW / 2, roleY, roleW > 0 ? roleW : 300, 44, 22);
  ctx.fill();

  monoText(ctx, `⚡ ${displayStack(stack)} ⚡`, w / 2, roleY + 30, { size: 22, color: '#0b2f1f', align: 'center', weight: '900', tracking: 2 });
  ctx.restore();

  // 9. Bottom Section: Tropical Goa Ticket Pass Grid Box (Solid Cream Background)
  const secY = 1140;
  const secH = 640;
  ctx.save();
  roundRect(ctx, 80, secY, w - 160, secH, 30);
  ctx.fillStyle = '#fbf3de';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0b2f1f';
  ctx.stroke();

  // Vertical Column Dividers
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(11,47,31,0.2)';
  ctx.beginPath();
  ctx.moveTo(560, secY + 40);
  ctx.lineTo(560, secY + secH - 40);
  ctx.moveTo(1040, secY + 40);
  ctx.lineTo(1040, secY + secH - 40);
  ctx.stroke();

  // Column 1 (Left): Builder Aura & QR Code
  const col1X = 320;
  monoText(ctx, '✦ BUILDER AURA ✦', col1X, secY + 70, { size: 22, color: 'rgba(11,47,31,0.75)', align: 'center', weight: '700' });
  const EDITION_CLASSES: Record<EditionId, string> = {
    credential: 'MAX AURA SHIPPER ⚡',
    sundown: 'GOATED STACK GOD 🐐',
    postcard: 'NO CAP ARCHITECT 🧢',
    transit: 'SIGMA PROTOCOL DEV 🧠',
  };
  monoText(ctx, EDITION_CLASSES[editionId] || identity.cls || 'MAX AURA SHIPPER ⚡', col1X, secY + 124, { size: 28, color: '#f2226b', align: 'center', weight: '900' });

  // QR Box
  const qrS = 240;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, col1X - qrS / 2, secY + 170, qrS, qrS, 20);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#0b2f1f';
  ctx.stroke();

  qrMark(ctx, col1X - qrS / 2 + 15, secY + 185, qrS - 30, identity.builderId || '#HH-GOA-7757', '#0b2f1f');
  monoText(ctx, '⚡ SCAN FOR ACCESS', col1X, secY + 475, { size: 20, color: '#f2226b', align: 'center', weight: '900' });

  // Column 2 (Middle): Goa Vibes
  const col2X = 800;
  monoText(ctx, '✦ GOA VIBES ✦', col2X, secY + 70, { size: 22, color: 'rgba(11,47,31,0.75)', align: 'center', weight: '700' });
  monoText(ctx, '🥥  COCONUT', col2X, secY + 180, { size: 28, color: '#0b2f1f', align: 'center', weight: '900' });
  monoText(ctx, '💻  VS CODE', col2X, secY + 270, { size: 28, color: '#0b2f1f', align: 'center', weight: '900' });
  monoText(ctx, '🎧  LO-FI VIBES', col2X, secY + 360, { size: 28, color: '#0b2f1f', align: 'center', weight: '900' });

  // Column 3 (Right): Shipping Status & Builder ID Pass Box
  const col3X = 1280;
  monoText(ctx, '✦ SHIPPING STATUS ✦', col3X, secY + 70, { size: 22, color: 'rgba(11,47,31,0.75)', align: 'center', weight: '700' });
  monoText(ctx, 'BUILDING FUTURE', col3X, secY + 124, { size: 28, color: '#f2226b', align: 'center', weight: '900' });

  // Builder ID Box
  const idW = 360;
  const idH = 150;
  ctx.fillStyle = '#0b2f1f';
  roundRect(ctx, col3X - idW / 2, secY + 210, idW, idH, 20);
  ctx.fill();

  monoText(ctx, 'BUILDER ID', col3X, secY + 260, { size: 20, color: '#ffd400', align: 'center', weight: '900', tracking: 4 });
  monoText(ctx, identity.builderId || '#HH-GOA-7757', col3X, secY + 325, { size: 38, color: '#ffffff', align: 'center', weight: '900', tracking: 2 });
  ctx.restore();

  // 10. Bottom Banner: #FRAMEINGOA
  const banY = 1840;
  ctx.save();
  roundRect(ctx, 80, banY, w - 160, 100, 24);
  ctx.fillStyle = '#f2226b';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  monoText(ctx, '✦ #FRAMEINGOA ✦', w * 0.5, banY + 64, { size: 36, color: '#ffffff', align: 'center', weight: '900', tracking: 6 });
  ctx.restore();
}

export function renderCard(canvas: HTMLCanvasElement, edition: EditionConfig, data: RenderData, dpr = 2) {
  canvas.width = CARD_W * dpr;
  canvas.height = CARD_H * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  edition.draw({ ctx, w: CARD_W, h: CARD_H, ...data });
}

export function renderOGCard(canvas: HTMLCanvasElement, edition: EditionConfig, data: RenderData) {
  const OG_W = 1200;
  const OG_H = 630;
  const scale = 2;
  canvas.width = OG_W * scale;
  canvas.height = OG_H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  ctx.fillStyle = COLOR.green;
  ctx.fillRect(0, 0, OG_W, OG_H);

  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = CARD_W;
  cardCanvas.height = CARD_H;
  const cardCtx = cardCanvas.getContext('2d')!;
  edition.draw({ ctx: cardCtx, w: CARD_W, h: CARD_H, ...data });

  const cardH = 570;
  const cardW = Math.round(cardH * (CARD_W / CARD_H));
  const cardX = Math.round((OG_W - cardW) / 2);
  const cardY = Math.round((OG_H - cardH) / 2);

  ctx.save();
  ctx.shadowColor = 'rgba(11, 47, 31, 0.45)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;

  const radius = 20;
  ctx.fillStyle = COLOR.cream;
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();
  } else {
    ctx.fillRect(cardX, cardY, cardW, cardH);
  }

  ctx.save();
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.clip();
  }
  ctx.drawImage(cardCanvas, cardX, cardY, cardW, cardH);
  ctx.restore();

  ctx.restore();
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
