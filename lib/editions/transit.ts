import { COLOR, FONT, SAFE_MARGIN } from '../tokens';
import { drawHalftone } from '../halftone';
import { drawWaveTriple, drawSunRays, drawPerforatedFrame, drawBarcode, drawLanyardClip, drawApprovedStamp, drawSignpost, drawFrameInGoaBanner, drawGoaBeachScenery } from '../illustrations';
import { offsetText, monoText, govaMark, pinkSeal, placePhoto, chip, qrMark, type EditionConfig, displayName, displayStack } from '../render/engine';

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
  copy: 'TRANSIT — luggage tag pass, green press',
  stock: 'press',
  swatchBg: COLOR.green,
  swatchFg: COLOR.yellow,
  aperture: { shape: 'rounded', x: 0.08, y: 0.22, w: 0.38, h: 0.38 * (1600 / 2000), radius: 0.03 },
  draw(rc) {
    const { ctx, w, h, name, stack, identity } = rc;
    const x = w * 0.03;
    const y = h * 0.02;
    const tw = w * 0.94;
    const th = h * 0.96;
    const holeCX = x + tw / 2;
    const holeCY = y + 42;

    ctx.save();
    tagPath(ctx, x, y, tw, th, 44, holeCX, holeCY, 18);
    ctx.clip('evenodd');

    ctx.fillStyle = COLOR.green;
    ctx.fillRect(x, y, tw, th);
    drawHalftone(ctx, { x, y: y + th * 0.5, w: tw, h: th * 0.5, axis: 'y', grid: 13, maxRadius: 4.2, colorFrom: COLOR.green, colorTo: COLOR.ink, jitter: 0.1, seed: 4 });

    // Top Header: HACKER GOA HOUSE
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `900 48px ${FONT.display}`;
    ctx.fillStyle = COLOR.yellow;
    ctx.fillText('HACKER', w * 0.5 - 130, y + 80);
    ctx.fillText('HOUSE', w * 0.5 + 130, y + 80);
    govaMark(ctx, w * 0.5, y + 82, 46, -6, 'center');
    monoText(ctx, '✦ GOA TRANSIT PASS • HH GOA 2026 ✦', w * 0.5, y + 112, { size: 11, color: COLOR.cream, align: 'center', weight: '700', tracking: 2 });
    ctx.restore();

    // Photo Section (Left)
    placePhoto(rc, transit.aperture, COLOR.green, COLOR.lime, COLOR.yellow);
    chip(ctx, transit.aperture.x * w + 45, transit.aperture.y * h + transit.aperture.h * h + 12, 'BUILDER', {
      bg: COLOR.pink,
      fg: COLOR.cream,
      rot: -6,
      size: 14,
    });

    // Right Details Panel
    const rightX = w * 0.5;
    let detailY = 175;

    // Name
    offsetText(ctx, displayName(name), rightX, detailY, { font: FONT.display, size: 52, color: COLOR.cream, align: 'left' });
    detailY += 42;
    monoText(ctx, `✦ ${displayStack(stack)} ✦`, rightX, detailY, { size: 13, color: COLOR.lime, weight: '700', tracking: 1 });

    // Divider Line
    ctx.strokeStyle = 'rgba(251,243,222,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightX, detailY + 12);
    ctx.lineTo(w - SAFE_MARGIN, detailY + 12);
    ctx.stroke();

    detailY += 40;
    monoText(ctx, '🌴 BUILDER CLASS', rightX, detailY, { size: 11, color: COLOR.lime, tracking: 1 });
    monoText(ctx, identity.cls.toUpperCase(), rightX, detailY + 22, { size: 15, color: COLOR.yellow, weight: '700', tracking: 1 });

    detailY += 56;
    monoText(ctx, '💻 SKILLS / STACK', rightX, detailY, { size: 11, color: COLOR.lime, tracking: 1 });
    monoText(ctx, displayStack(stack), rightX, detailY + 22, { size: 14, color: COLOR.cream, weight: '700', tracking: 1 });

    detailY += 56;
    monoText(ctx, '✉️ TEAM VIBES', rightX, detailY, { size: 11, color: COLOR.lime, tracking: 1 });
    monoText(ctx, 'BUILD • SHIP • REPEAT', rightX, detailY + 22, { size: 14, color: COLOR.pink, weight: '700', tracking: 1 });

    // Perforated Stub Divider
    const stubY = h * 0.68;
    drawPerforatedFrame(ctx, x + 20, stubY, tw - 40, 0.01, COLOR.cream, 20, 3);
    drawWaveTriple(ctx, x + 30, stubY + 24, tw - 60, COLOR.lime, 3.5);

    // Barcode & Builder ID
    drawBarcode(ctx, x + 30, stubY + 54, tw * 0.46, 36, identity.builderId, COLOR.cream);
    monoText(ctx, identity.builderId, x + 30, stubY + 106, { size: 14, color: COLOR.yellow, weight: '700', tracking: 1 });

    // QR Code
    qrMark(ctx, w * 0.56, stubY + 45, 84, identity.builderId, COLOR.yellow);

    // Approved Rubber Stamp
    drawApprovedStamp(ctx, w * 0.84, stubY + 80, 42, -10);

    // Bottom Banner
    drawFrameInGoaBanner(ctx, w * 0.5, h - 35, w * 0.85, 38);

    ctx.restore();

    // Die-cut printed outline
    ctx.save();
    tagPath(ctx, x, y, tw, th, 44, holeCX, holeCY, 18);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(251,243,222,.5)';
    ctx.stroke();
    ctx.restore();
  },
};
