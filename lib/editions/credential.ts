import { COLOR, FONT, SAFE_MARGIN } from '../tokens';
import { drawSunRays, drawPalmCluster, drawLanyardClip, drawApprovedStamp, drawSignpost, drawFrameInGoaBanner, drawGoaBeachScenery } from '../illustrations';
import { drawPaperGrain } from '../halftone';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, roundRect, chip, qrMark, type EditionConfig, displayName, displayStack } from '../render/engine';

export const credential: EditionConfig = {
  id: 'credential',
  label: 'CREDENTIAL',
  copy: 'CREDENTIAL — official lanyard badge, cream stock',
  stock: 'paper',
  swatchBg: COLOR.cream,
  swatchFg: COLOR.green,
  aperture: { shape: 'circle', x: 0.08, y: 0.28, w: 0.38, h: 0.38 * (1600 / 2000) },
  draw(rc) {
    const { ctx, w, h, name, stack, identity } = rc;

    // Card background
    ctx.fillStyle = COLOR.cream;
    roundRect(ctx, 0, 0, w, h, w * 0.03);
    ctx.fill();
    drawPaperGrain(ctx, 0, 0, w, h, 33, 0.04);

    // Card Outer Border
    ctx.strokeStyle = COLOR.green;
    ctx.lineWidth = 6;
    roundRect(ctx, 8, 8, w - 16, h - 16, w * 0.025);
    ctx.stroke();

    // Lanyard Clip at top
    drawLanyardClip(ctx, w * 0.5, 0, 1);

    // Top Header Lockup: HACKER GOA HOUSE
    ctx.save();
    ctx.font = `900 44px ${FONT.display}`;
    ctx.fillStyle = COLOR.green;
    ctx.textAlign = 'right';
    ctx.fillText('HACKER', w * 0.5 - 60, 80);
    ctx.textAlign = 'left';
    ctx.fillText('HOUSE', w * 0.5 + 60, 80);
    govaMark(ctx, w * 0.5, 82, 44, -6, 'center');
    monoText(ctx, '✦ BUILD IN GOA, SHIP FROM PARADISE ✦', w * 0.5, 112, { size: 12, color: COLOR.pink, align: 'center', weight: '700', tracking: 2 });
    ctx.restore();

    // Photo Section (Left)
    placePhoto(rc, credential.aperture, COLOR.yellow, COLOR.pink, COLOR.green);
    chip(ctx, credential.aperture.x * w + 45, credential.aperture.y * h + credential.aperture.h * h - 10, 'BUILDER', {
      bg: COLOR.pink,
      fg: COLOR.cream,
      rot: -6,
      size: 14,
    });

    // Right Details Panel
    const rightX = w * 0.5;
    let detailY = 175;

    // Name
    offsetText(ctx, displayName(name), rightX, detailY, { font: FONT.display, size: 52, color: COLOR.green, align: 'left' });
    detailY += 42;
    monoText(ctx, `✦ ${displayStack(stack)} ✦`, rightX, detailY, { size: 13, color: COLOR.pink, weight: '700', tracking: 1 });

    // Divider Line
    ctx.strokeStyle = 'rgba(11,47,31,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightX, detailY + 12);
    ctx.lineTo(w - SAFE_MARGIN, detailY + 12);
    ctx.stroke();

    detailY += 40;
    // BUILDER CLASS
    monoText(ctx, '🌴 BUILDER CLASS', rightX, detailY, { size: 11, color: COLOR.greenMid, tracking: 1 });
    monoText(ctx, identity.cls.toUpperCase(), rightX, detailY + 22, { size: 15, color: COLOR.pink, weight: '700', tracking: 1 });

    detailY += 56;
    // SKILLS
    monoText(ctx, '💻 SKILLS / STACK', rightX, detailY, { size: 11, color: COLOR.greenMid, tracking: 1 });
    monoText(ctx, displayStack(stack), rightX, detailY + 22, { size: 14, color: COLOR.green, weight: '700', tracking: 1 });

    detailY += 56;
    // TEAM VIBES
    monoText(ctx, '✉️ TEAM VIBES', rightX, detailY, { size: 11, color: COLOR.greenMid, tracking: 1 });
    monoText(ctx, 'BUILD • SHIP • REPEAT', rightX, detailY + 22, { size: 14, color: COLOR.pink, weight: '700', tracking: 1 });

    // Lower Section: Builder ID & QR Code
    const lowerY = h * 0.68;
    roundRect(ctx, SAFE_MARGIN, lowerY, w * 0.42, 100, 10);
    ctx.fillStyle = COLOR.green;
    ctx.fill();

    monoText(ctx, 'BUILDER ID', SAFE_MARGIN + 16, lowerY + 28, { size: 11, color: COLOR.yellow, weight: '700', tracking: 2 });
    monoText(ctx, identity.builderId, SAFE_MARGIN + 16, lowerY + 62, { size: 20, color: COLOR.cream, weight: '700', tracking: 1 });

    monoText(ctx, 'VENUE: GOA, INDIA', SAFE_MARGIN + 16, lowerY + 84, { size: 10, color: COLOR.pink, tracking: 1 });
    monoText(ctx, 'DATE: 28–31 OCT 2026', SAFE_MARGIN + 16, lowerY + 96, { size: 10, color: COLOR.cream, tracking: 1 });

    // QR Code
    qrMark(ctx, w * 0.52, lowerY, 96, identity.builderId, COLOR.green);
    monoText(ctx, '✦ SCAN TO EXPLORE ✦', w * 0.52, lowerY + 114, { size: 10, color: COLOR.pink, tracking: 1 });

    // Signpost
    drawSignpost(ctx, SAFE_MARGIN + 35, lowerY + 130, 0.7);

    // Palm Tree
    drawPalmCluster(ctx, w * 0.82, h - 80, { ink: COLOR.green, light: COLOR.yellow }, 2, 0.75);

    // Approved Rubber Stamp
    drawApprovedStamp(ctx, w * 0.78, lowerY + 50, 44, -12);

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
