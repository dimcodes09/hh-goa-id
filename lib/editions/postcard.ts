import { COLOR, FONT, SAFE_MARGIN } from '../tokens';
import { drawWaveTriple, drawPalmCluster, drawPerforatedFrame, drawStar4pt } from '../illustrations';
import { drawPaperGrain } from '../halftone';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, roundRect, type EditionConfig, displayName } from '../render/engine';

export const postcard: EditionConfig = {
  id: 'postcard',
  label: 'POSTCARD',
  copy: 'POSTCARD — wish you were building, cream stock',
  stock: 'paper',
  swatchBg: COLOR.cream,
  swatchFg: COLOR.ink,
  aperture: { shape: 'arch', x: 0.1, y: 0.11, w: 0.5, h: 0.42, radius: 0.03 },
  draw(rc) {
    const { ctx, w, h, name, stack, identity } = rc;
    ctx.fillStyle = COLOR.cream;
    roundRect(ctx, 0, 0, w, h, w * 0.025);
    ctx.fill();
    drawPaperGrain(ctx, 0, 0, w, h, 21, 0.045);
    ctx.save();
    roundRect(ctx, SAFE_MARGIN * 0.4, SAFE_MARGIN * 0.4, w - SAFE_MARGIN * 0.8, h - SAFE_MARGIN * 0.8, w * 0.02);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(11,47,31,.18)';
    ctx.stroke();
    ctx.restore();

    monoText(ctx, 'GOA, INDIA', SAFE_MARGIN, SAFE_MARGIN + 20, { size: 15, color: COLOR.greenMid, tracking: 2 });
    monoText(ctx, 'POST CARD', SAFE_MARGIN, SAFE_MARGIN + 48, { size: 22, color: COLOR.ink, weight: '700', tracking: 3 });

    // stamp corner, top right
    const sx = w - SAFE_MARGIN - 150;
    const sy = SAFE_MARGIN;
    drawPerforatedFrame(ctx, sx, sy, 150, 130, COLOR.greenMid, 16, 5);
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, sx + 14, sy + 14, 122, 102, 4);
    ctx.clip();
    ctx.fillStyle = COLOR.green;
    ctx.fillRect(sx + 14, sy + 14, 122, 102);
    drawStar4pt(ctx, sx + 75, sy + 65, 34, COLOR.yellow, 8);
    ctx.restore();
    monoText(ctx, 'AIR MAIL', sx + 14, sy + 148, { size: 9, color: COLOR.greenMid, tracking: 1 });

    placePhoto(rc, postcard.aperture, COLOR.creamShade, COLOR.green, COLOR.ink);

    const nameX = SAFE_MARGIN;
    let nameY = h * 0.62;
    offsetText(ctx, displayName(name), nameX, nameY, { font: FONT.display, size: 108, color: COLOR.ink, align: 'left' });
    nameY += 70;
    if (ctx.measureText(displayName(name)).width > w - SAFE_MARGIN * 2) nameY += 30;

    monoText(ctx, `IS BUILDING IN`, nameX, nameY + 46, { size: 16, color: COLOR.greenMid, tracking: 2 });
    govaMark(ctx, nameX + 250, nameY + 48, 34, -5);
    monoText(ctx, displayStackShort(stack), nameX, nameY + 78, { size: 13, color: COLOR.ink, tracking: 1 });

    drawPalmCluster(ctx, w * 0.58, h - SAFE_MARGIN - 30, { ink: COLOR.green, light: COLOR.lime }, 3, 0.7);
    drawWaveTriple(ctx, SAFE_MARGIN, h - SAFE_MARGIN - 26, w - SAFE_MARGIN * 2, COLOR.teal, 4);

    monoText(ctx, `${identity.builderId} · 28–31 OCT 2026`, SAFE_MARGIN, h - SAFE_MARGIN + 12, { size: 12, color: COLOR.ink });

    pinkSeal(ctx, w - SAFE_MARGIN - 90, h - SAFE_MARGIN - 60, 76, 12, ['HH GOA', identity.builderId.replace('#HH-GOA-', '')]);
  },
};

function displayStackShort(stack: string) {
  return stack.trim() ? stack.trim().toUpperCase() : 'FULL-STACK BUILDER';
}
