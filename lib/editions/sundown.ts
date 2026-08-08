import { COLOR, FONT, SAFE_MARGIN } from '../tokens';
import { drawHalftone } from '../halftone';
import { drawSunRays, drawPalmCluster, drawWaveTriple, drawApprovedStamp, drawSignpost, drawFrameInGoaBanner, drawGoaBeachScenery } from '../illustrations';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, roundRect, chip, qrMark, type EditionConfig, displayName, displayStack } from '../render/engine';

export const sundown: EditionConfig = {
  id: 'sundown',
  label: 'SUNDOWN',
  copy: 'SUNDOWN — dusk festival pass, lime & ink press',
  stock: 'press',
  swatchBg: COLOR.lime,
  swatchFg: COLOR.ink,
  aperture: { shape: 'circle', x: 0.5 - 0.19, y: 0.22, w: 0.38, h: 0.38 * (1600 / 2000) },
  draw(rc) {
    const { ctx, w, h, name, stack, identity } = rc;

    // Sunset Backing
    ctx.fillStyle = COLOR.lime;
    ctx.fillRect(0, 0, w, h * 0.62);
    ctx.fillStyle = COLOR.green;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);

    drawHalftone(ctx, { x: 0, y: 0, w, h: h * 0.62, axis: 'y', grid: 14, maxRadius: 4.6, colorFrom: COLOR.lime, colorTo: COLOR.green, jitter: 0.08, seed: 8 });

    // Golden Sunset Rays
    drawSunRays(ctx, w * 0.5, h * 0.24, w * 0.22, { ink: COLOR.yellow, light: COLOR.yellowDeep }, 18);

    // Header Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `900 50px ${FONT.display}`;
    ctx.fillStyle = COLOR.ink;
    ctx.fillText('HACKER HOUSE', w * 0.5, 75);
    govaMark(ctx, w * 0.5, 115, 52, -5, 'center');
    monoText(ctx, '2026 • GOA DUSK FESTIVAL', w * 0.5, 142, { size: 13, color: COLOR.ink, align: 'center', weight: '700', tracking: 3 });
    ctx.restore();

    // Photo Section (Centered Circular Frame)
    placePhoto(rc, sundown.aperture, COLOR.lime, COLOR.ink, COLOR.yellow);
    chip(ctx, w * 0.5, sundown.aperture.y * h + sundown.aperture.h * h + 12, 'BUILDER', {
      bg: COLOR.pink,
      fg: COLOR.cream,
      rot: -4,
      size: 14,
    });

    // Details Block (Centered)
    const detailY = sundown.aperture.y * h + sundown.aperture.h * h + 70;
    offsetText(ctx, displayName(name), w * 0.5, detailY, { font: FONT.display, size: 56, color: COLOR.cream, shadow: 'rgba(0,0,0,0.5)', align: 'center' });

    monoText(ctx, `✦ ${displayStack(stack)} ✦`, w * 0.5, detailY + 36, { size: 14, color: COLOR.yellow, align: 'center', weight: '700', tracking: 2 });

    chip(ctx, w * 0.5, detailY + 74, `THE SHIP MACHINE • ${identity.cls.toUpperCase()}`, {
      bg: COLOR.pink,
      fg: COLOR.cream,
      rot: 0,
      size: 13,
      padX: 20,
    });

    // Lower Section: QR Code & ID
    const lowerY = h * 0.72;

    roundRect(ctx, SAFE_MARGIN + 20, lowerY, w * 0.44, 90, 10);
    ctx.fillStyle = 'rgba(11,47,31,0.85)';
    ctx.fill();
    ctx.strokeStyle = COLOR.yellow;
    ctx.lineWidth = 2;
    ctx.stroke();

    monoText(ctx, 'BUILDER ID', SAFE_MARGIN + 36, lowerY + 28, { size: 11, color: COLOR.yellow, weight: '700', tracking: 2 });
    monoText(ctx, identity.builderId, SAFE_MARGIN + 36, lowerY + 60, { size: 19, color: COLOR.cream, weight: '700', tracking: 1 });

    // QR Code
    qrMark(ctx, w * 0.62, lowerY - 6, 92, identity.builderId, COLOR.yellow);

    // Approved Rubber Stamp
    drawApprovedStamp(ctx, w * 0.85, lowerY + 30, 40, -15);

    // Palm Trees at bottom edges
    drawPalmCluster(ctx, SAFE_MARGIN, h - 70, { ink: COLOR.ink, light: COLOR.yellow }, 2, 0.7);

    // Wave Lines
    drawWaveTriple(ctx, 0, h * 0.6, w, COLOR.lime, 4);

    // Bottom Banner
    drawFrameInGoaBanner(ctx, w * 0.5, h - 35, w * 0.85, 38);
  },
};
