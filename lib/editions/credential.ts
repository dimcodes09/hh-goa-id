import { COLOR, FONT, SAFE_MARGIN } from '../tokens';
import { drawSunRays, drawStar4pt } from '../illustrations';
import { drawPaperGrain } from '../halftone';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, roundRect, chip, qrMark, type EditionConfig, displayName, displayStack } from '../render/engine';

export const credential: EditionConfig = {
  id: 'credential',
  label: 'CREDENTIAL',
  copy: 'CREDENTIAL — event badge, cream stock',
  stock: 'paper',
  swatchBg: COLOR.cream,
  swatchFg: COLOR.green,
  aperture: { shape: 'circle', x: 0.5 - 0.19, y: 0.3, w: 0.38, h: 0.38 * (1600 / 2000) },
  draw(rc) {
    const { ctx, w, h, name, stack, identity } = rc;
    ctx.fillStyle = COLOR.cream;
    roundRect(ctx, 0, 0, w, h, w * 0.03);
    ctx.fill();
    drawPaperGrain(ctx, 0, 0, w, h, 33, 0.045);

    const headerH = h * 0.16;
    ctx.save();
    roundRect(ctx, 0, 0, w, h, w * 0.03);
    ctx.clip();
    ctx.fillStyle = COLOR.green;
    ctx.fillRect(0, 0, w, headerH);
    drawSunRays(ctx, w * 0.5, -headerH * 0.3, headerH * 0.9, { ink: 'rgba(255,212,0,.14)', light: 'rgba(255,212,0,.06)' }, 16);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = `900 46px ${FONT.display}`;
    ctx.fillStyle = COLOR.yellow;
    ctx.fillText('HACKER', w * 0.5 - 108, headerH * 0.46);
    ctx.fillText('HOUSE', w * 0.5 + 130, headerH * 0.46);
    govaMark(ctx, w * 0.5, headerH * 0.48, 44, -6, 'center');
    monoText(ctx, 'BUILDER CREDENTIAL / HH GOA 2026', w * 0.5, headerH * 0.78, { size: 13, color: COLOR.cream, align: 'center', weight: '400', tracking: 2 });

    placePhoto(rc, credential.aperture, COLOR.creamShade, COLOR.pink, COLOR.ink);
    chip(ctx, credential.aperture.x * w + credential.aperture.w * w + 6, credential.aperture.y * h + 4, "LET'S BUILD!", {
      bg: COLOR.yellow,
      fg: COLOR.ink,
      rot: -8,
      size: 13,
    });

    const nameY = credential.aperture.y * h + credential.aperture.h * h + 90;
    offsetText(ctx, displayName(name), SAFE_MARGIN, nameY, { font: FONT.display, size: 76, color: COLOR.ink, align: 'left' });

    ctx.strokeStyle = COLOR.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(SAFE_MARGIN, nameY + 26);
    ctx.lineTo(w - SAFE_MARGIN, nameY + 26);
    ctx.stroke();

    monoText(ctx, displayStack(stack), SAFE_MARGIN, nameY + 58, { size: 15, color: COLOR.ink, weight: '400', tracking: 1 });

    monoText(ctx, 'BUILDER CLASS', SAFE_MARGIN, nameY + 108, { size: 12, color: 'rgba(11,47,31,.5)', tracking: 2 });
    offsetText(ctx, identity.cls, SAFE_MARGIN, nameY + 148, { font: FONT.display, size: 40, color: COLOR.pink, shadow: 'rgba(11,47,31,.15)', offset: 3, align: 'left' });

    drawStar4pt(ctx, w - SAFE_MARGIN - 30, nameY + 40, 16, COLOR.yellowDeep, 12);
    qrMark(ctx, SAFE_MARGIN, nameY + 175, 96, identity.builderId, COLOR.ink);
    monoText(ctx, 'SCAN TO', SAFE_MARGIN + 108, nameY + 205, { size: 10, color: 'rgba(11,47,31,.5)', tracking: 1 });
    monoText(ctx, 'RSVP', SAFE_MARGIN + 108, nameY + 224, { size: 15, color: COLOR.ink, weight: '700', tracking: 1 });

    monoText(ctx, `${identity.builderId} · ED 01/∞ · 28–31 OCT · GOA, IN`, w / 2, h - SAFE_MARGIN + 8, { size: 13, color: COLOR.ink, align: 'center' });

    pinkSeal(ctx, w - SAFE_MARGIN - 74, nameY + 100, 82, -8, ['HH', 'GOA']);
  },
};
