import { COLOR, FONT, SAFE_MARGIN } from '../tokens';
import { drawHalftone } from '../halftone';
import { drawSunRays, drawPalmCluster, drawWaveTriple } from '../illustrations';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, type EditionConfig, displayName, displayStack } from '../render/engine';

export const sundown: EditionConfig = {
  id: 'sundown',
  label: 'SUNDOWN',
  copy: 'SUNDOWN — halftone lime→ink, press',
  stock: 'press',
  swatchBg: COLOR.lime,
  swatchFg: COLOR.ink,
  aperture: { shape: 'rounded', x: 0.1, y: 0.08, w: 0.34, h: 0.34 * (1600 / 2000), radius: 0.02 },
  draw(rc) {
    const { ctx, w, h, name, stack, identity } = rc;

    // solid backing first — the halftone pass only adds dot texture on top, gaps must never read as transparent
    ctx.fillStyle = COLOR.lime;
    ctx.fillRect(0, 0, w, h * 0.66);
    ctx.fillStyle = COLOR.ink;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
    drawHalftone(ctx, { x: 0, y: 0, w, h: h * 0.66, axis: 'y', grid: 14, maxRadius: 4.6, colorFrom: COLOR.lime, colorTo: COLOR.ink, jitter: 0.08, seed: 8 });
    drawHalftone(ctx, { x: 0, y: h * 0.5, w, h: h * 0.16, axis: 'y', grid: 14, maxRadius: 4.6, colorFrom: COLOR.lime, colorTo: COLOR.ink, jitter: 0.08, seed: 8 });

    drawSunRays(ctx, w * 0.72, h * 0.34, w * 0.15, { ink: COLOR.yellow, light: COLOR.yellowDeep }, 18);
    drawWaveTriple(ctx, 0, h * 0.6, w, COLOR.cream, 5);
    drawPalmCluster(ctx, w * 0.04, h * 0.66, { ink: COLOR.ink, light: 'rgba(11,47,31,.4)' }, 3, 0.85);

    monoText(ctx, 'HACKER', SAFE_MARGIN, SAFE_MARGIN + 4, { size: 15, color: COLOR.ink, tracking: 2 });
    govaMark(ctx, SAFE_MARGIN + 84, SAFE_MARGIN + 6, 20, -6);
    monoText(ctx, 'HOUSE', SAFE_MARGIN + 148, SAFE_MARGIN + 4, { size: 15, color: COLOR.ink, tracking: 2 });

    placePhoto(rc, sundown.aperture, COLOR.lime, COLOR.ink, COLOR.cream);
    monoText(ctx, displayName(name), sundown.aperture.x * w, (sundown.aperture.y + sundown.aperture.h) * h + 30, { size: 15, color: COLOR.ink, weight: '700', tracking: 1 });
    monoText(ctx, displayStack(stack), sundown.aperture.x * w, (sundown.aperture.y + sundown.aperture.h) * h + 54, { size: 12, color: COLOR.ink, weight: '400' });

    // the aura line is the hero — inverted hierarchy
    const auraY = h * 0.82;
    offsetText(ctx, `CURRENTLY:`, SAFE_MARGIN, auraY, { font: FONT.display, size: 42, color: COLOR.cream, shadow: 'rgba(255,212,0,.35)', offset: 4, align: 'left' });
    offsetText(ctx, identity.currently, SAFE_MARGIN, auraY + 78, { font: FONT.display, size: 74, color: COLOR.cream, align: 'left' });

    monoText(ctx, `${identity.builderId} · ${identity.cls}`, SAFE_MARGIN, h - SAFE_MARGIN + 8, { size: 12, color: COLOR.lime });
    monoText(ctx, 'GOA · 28–31 OCT 2026', w - SAFE_MARGIN, h - SAFE_MARGIN + 8, { size: 12, color: COLOR.lime, align: 'right' });

    pinkSeal(ctx, w - SAFE_MARGIN - 90, auraY - 50, 78, 10, ['DUSK', identity.builderId.replace('#HH-GOA-', '')]);
  },
};
