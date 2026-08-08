import { COLOR, FONT } from '../tokens';
import { drawHalftone } from '../halftone';
import { drawWaveTriple, drawSunRays, drawPerforatedFrame, drawBarcode } from '../illustrations';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, chip, qrMark, type EditionConfig, displayName } from '../render/engine';

function tagPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, chamfer: number, holeCX: number, holeCY: number, holeR: number) {
  ctx.beginPath();
  ctx.moveTo(x + chamfer, y);
  ctx.lineTo(x + w - chamfer, y);
  ctx.lineTo(x + w, y + chamfer);
  ctx.lineTo(x + w, y + h - 26);
  ctx.quadraticCurveTo(x + w, y + h, x + w - 26, y + h);
  ctx.lineTo(x + 26, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - 26);
  ctx.lineTo(x, y + chamfer);
  ctx.closePath();
  ctx.moveTo(holeCX + holeR, holeCY);
  ctx.arc(holeCX, holeCY, holeR, 0, Math.PI * 2);
}

export const transit: EditionConfig = {
  id: 'transit',
  label: 'TRANSIT',
  copy: 'TRANSIT — luggage tag, green press',
  stock: 'press',
  swatchBg: COLOR.green,
  swatchFg: COLOR.yellow,
  aperture: { shape: 'rounded', x: 0.14, y: 0.2, w: 0.72, h: 0.34, radius: 0.02 },
  draw(rc) {
    const { ctx, w, h, name, identity } = rc;
    const x = w * 0.04;
    const y = h * 0.03;
    const tw = w * 0.92;
    const th = h * 0.94;
    const holeCX = x + tw / 2;
    const holeCY = y + 46;

    ctx.save();
    tagPath(ctx, x, y, tw, th, 46, holeCX, holeCY, 20);
    ctx.clip('evenodd');

    ctx.fillStyle = COLOR.green;
    ctx.fillRect(x, y, tw, th);
    drawHalftone(ctx, { x, y: y + th * 0.55, w: tw, h: th * 0.45, axis: 'y', grid: 13, maxRadius: 4.2, colorFrom: COLOR.green, colorTo: COLOR.ink, jitter: 0.1, seed: 4 });
    drawSunRays(ctx, x + tw - 90, y + 120, 46, { ink: COLOR.yellow, light: COLOR.yellowDeep });

    monoText(ctx, 'HACKER', x + 40, y + 100, { size: 15, color: COLOR.yellow, tracking: 2 });
    govaMark(ctx, x + 128, y + 101, 20, -6);
    monoText(ctx, 'HOUSE', x + 195, y + 100, { size: 15, color: COLOR.yellow, tracking: 2 });
    monoText(ctx, 'BUILDER CREDENTIAL · HH GOA 2026', x + 40, y + 122, { size: 10, color: COLOR.cream, weight: '400' });

    const ap = transit.aperture;
    placePhoto(rc, ap, COLOR.green, COLOR.lime, COLOR.cream);

    const nameY = (ap.y + ap.h) * h + 96;
    offsetText(ctx, displayName(name), x + 40, nameY, { font: FONT.display, size: 84, color: COLOR.cream, align: 'left' });
    const nameY2 = nameY + 82;
    monoText(ctx, identity.cls, x + 40, nameY2, { size: 16, color: COLOR.lime, tracking: 2 });

    // perforated stub divider
    const stubY = y + th - 150;
    drawPerforatedFrame(ctx, x + 20, stubY, tw - 40, 0.01, COLOR.cream, 20, 3);
    drawWaveTriple(ctx, x + 30, stubY + 34, tw - 60, COLOR.lime, 3.5);

    drawBarcode(ctx, x + 40, y + th - 78, tw * 0.5, 34, identity.builderId, COLOR.cream);
    qrMark(ctx, x + tw - 100, y + th - 100, 60, identity.builderId, COLOR.cream);
    monoText(ctx, identity.builderId, x + 40, y + th - 40, { size: 12, color: COLOR.cream });
    monoText(ctx, 'GOA · 28–31 OCT', x + tw - 40, y + th - 40, { size: 12, color: COLOR.cream, align: 'right' });

    chip(ctx, x + 96, y + 200, 'LET’S BUILD!', { bg: COLOR.yellow, fg: COLOR.ink, rot: -7, size: 13 });
    pinkSeal(ctx, x + tw - 96, stubY - 8, 74, -9, ['ISSUED', identity.builderId.replace('#HH-GOA-', '')]);
    ctx.restore();

    // die-cut printed outline
    ctx.save();
    tagPath(ctx, x, y, tw, th, 46, holeCX, holeCY, 20);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(251,243,222,.5)';
    ctx.stroke();
    ctx.restore();
  },
};
