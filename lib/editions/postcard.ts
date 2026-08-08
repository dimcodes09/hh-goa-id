import { COLOR, FONT, SAFE_MARGIN } from '../tokens';
import { drawWaveTriple, drawPalmCluster, drawPerforatedFrame, drawStar4pt, drawApprovedStamp, drawSignpost, drawFrameInGoaBanner, drawGoaBeachScenery } from '../illustrations';
import { drawPaperGrain } from '../halftone';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, roundRect, qrMark, type EditionConfig, displayName, displayStack } from '../render/engine';

export const postcard: EditionConfig = {
  id: 'postcard',
  label: 'POSTCARD',
  copy: 'POSTCARD — wish you were building, cream stock',
  stock: 'paper',
  swatchBg: COLOR.cream,
  swatchFg: COLOR.ink,
  aperture: { shape: 'circle', x: 0.08, y: 0.24, w: 0.38, h: 0.38 * (1600 / 2000) },
  draw(rc) {
    const { ctx, w, h, name, stack, identity } = rc;

    // Card background
    ctx.fillStyle = COLOR.cream;
    roundRect(ctx, 0, 0, w, h, w * 0.025);
    ctx.fill();
    drawPaperGrain(ctx, 0, 0, w, h, 24, 0.04);

    // Double Border
    ctx.save();
    roundRect(ctx, 10, 10, w - 20, h - 20, w * 0.02);
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLOR.green;
    ctx.stroke();
    ctx.restore();

    // Top Right Postage Stamp
    const sx = w - 170;
    const sy = 24;
    drawPerforatedFrame(ctx, sx, sy, 140, 120, COLOR.greenMid, 16, 5);
    ctx.save();
    roundRect(ctx, sx + 12, sy + 12, 116, 96, 4);
    ctx.clip();
    ctx.fillStyle = COLOR.green;
    ctx.fillRect(sx + 12, sy + 12, 116, 96);
    drawPalmCluster(ctx, sx + 30, sy + 100, { ink: COLOR.yellow, light: COLOR.pink }, 2, 0.45);
    drawStar4pt(ctx, sx + 100, sy + 35, 20, COLOR.yellow, 8);
    monoText(ctx, 'GOA INDIA', sx + 20, sy + 30, { size: 10, color: COLOR.cream, weight: '700', tracking: 1 });
    ctx.restore();

    // Top Airmail Markings
    monoText(ctx, 'GOA, INDIA', SAFE_MARGIN + 10, 50, { size: 14, color: COLOR.greenMid, tracking: 2 });

    // Main Header: HACKER GOA HOUSE
    ctx.save();
    ctx.font = `900 44px ${FONT.display}`;
    ctx.fillStyle = COLOR.yellowDeep;
    ctx.textAlign = 'right';
    ctx.fillText('HACKER', w * 0.45 - 55, 105);
    ctx.textAlign = 'left';
    ctx.fillText('HOUSE', w * 0.45 + 55, 105);
    govaMark(ctx, w * 0.45, 107, 44, -6, 'center');
    monoText(ctx, '✦ BUILD IN GOA, SHIP FROM PARADISE ✦', w * 0.45, 138, { size: 11, color: COLOR.pink, align: 'center', weight: '700', tracking: 2 });
    ctx.restore();

    // Photo Section (Left)
    placePhoto(rc, postcard.aperture, COLOR.yellow, COLOR.pink, COLOR.green);

    // Right Details Panel
    const rightX = w * 0.5;
    let detailY = 175;

    // Name
    offsetText(ctx, displayName(name), rightX, detailY, { font: FONT.display, size: 54, color: COLOR.ink, align: 'left' });
    detailY += 42;
    monoText(ctx, `✦ ${displayStack(stack)} ✦`, rightX, detailY, { size: 13, color: COLOR.pink, weight: '700', tracking: 1 });

    // Divider Line
    ctx.strokeStyle = 'rgba(11,47,31,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightX, detailY + 12);
    ctx.lineTo(w - SAFE_MARGIN, detailY + 12);
    ctx.stroke();

    detailY += 42;
    monoText(ctx, '🌴 BUILDER CLASS', rightX, detailY, { size: 11, color: COLOR.greenMid, tracking: 1 });
    monoText(ctx, identity.cls.toUpperCase(), rightX, detailY + 22, { size: 15, color: COLOR.green, weight: '700', tracking: 1 });

    detailY += 56;
    monoText(ctx, '💻 SKILLS / STACK', rightX, detailY, { size: 11, color: COLOR.greenMid, tracking: 1 });
    monoText(ctx, displayStack(stack), rightX, detailY + 22, { size: 14, color: COLOR.ink, weight: '700', tracking: 1 });

    detailY += 56;
    monoText(ctx, '✉️ TEAM VIBES', rightX, detailY, { size: 11, color: COLOR.greenMid, tracking: 1 });
    monoText(ctx, 'BUILD • SHIP • REPEAT', rightX, detailY + 22, { size: 14, color: COLOR.pink, weight: '700', tracking: 1 });

    // Signpost Left
    drawSignpost(ctx, SAFE_MARGIN + 30, h * 0.64, 0.7);

    // Lower Section: Builder ID & QR Code
    const lowerY = h * 0.66;
    roundRect(ctx, w * 0.28, lowerY, w * 0.38, 96, 10);
    ctx.fillStyle = COLOR.green;
    ctx.fill();

    monoText(ctx, 'BUILDER ID', w * 0.28 + 16, lowerY + 28, { size: 11, color: COLOR.yellow, weight: '700', tracking: 2 });
    monoText(ctx, identity.builderId, w * 0.28 + 16, lowerY + 60, { size: 19, color: COLOR.cream, weight: '700', tracking: 1 });

    monoText(ctx, 'VENUE: GOA, INDIA', w * 0.28 + 16, lowerY + 82, { size: 10, color: COLOR.pink, tracking: 1 });
    monoText(ctx, 'DATE: 28–31 OCT 2026', w * 0.28 + 16, lowerY + 94, { size: 10, color: COLOR.cream, tracking: 1 });

    // QR Code
    qrMark(ctx, w * 0.69, lowerY, 96, identity.builderId, COLOR.ink);
    monoText(ctx, 'Scan me!', w * 0.69, lowerY + 114, { size: 12, color: COLOR.ink, tracking: 1 });

    // Bottom Goa Beach Scenery
    drawGoaBeachScenery(ctx, w, h, {
      skyColor: COLOR.cream,
      sunColor: COLOR.yellow,
      sandColor: '#e5ca80',
      waterColor: COLOR.green,
    });

    // Bottom Banner
    drawFrameInGoaBanner(ctx, w * 0.5, h - 35, w * 0.85, 38);
  },
};
