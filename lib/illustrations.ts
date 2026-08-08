// Hand-drawn (in code) tropical illustration kit — 1960s travel-poster silhouettes.
// Every asset: flat fill, no gradient, no shadow. `ink` + `light` are the only two colours used
// (light is a slight offset "misregistration" pass behind ink, like a two-colour screen print).

export interface InkPair {
  ink: string;
  light: string;
}

function taperedPath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number; w: number }[]
) {
  // build a filled ribbon: left edge forward, right edge backward, tapering per-point width
  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const prev = points[i - 1] ?? p;
    const next = points[i + 1] ?? p;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    left.push({ x: p.x + nx * (p.w / 2), y: p.y + ny * (p.w / 2) });
    right.push({ x: p.x - nx * (p.w / 2), y: p.y - ny * (p.w / 2) });
  }
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (const p of left) ctx.lineTo(p.x, p.y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fill();
}

function bezierPoints(
  p0: { x: number; y: number },
  c0: { x: number; y: number },
  p1: { x: number; y: number },
  w0: number,
  w1: number,
  steps = 14
) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt * mt * p0.x + 2 * mt * t * c0.x + t * t * p1.x;
    const y = mt * mt * p0.y + 2 * mt * t * c0.y + t * t * p1.y;
    const w = w0 + (w1 - w0) * t;
    pts.push({ x, y, w });
  }
  return pts;
}

/** One frond: curves out from origin, drooping toward the tip, tapering to a point. */
function frond(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  angleDeg: number,
  length: number,
  maxWidth: number,
  droop = 0.35
) {
  const a = (angleDeg * Math.PI) / 180;
  const tipX = ox + Math.cos(a) * length;
  const tipY = oy + Math.sin(a) * length;
  // control point bows the frond outward, then droop pulls the tip down (gravity)
  const midA = a - 0.05;
  const cx = ox + Math.cos(midA) * length * 0.55;
  const cy = oy + Math.sin(midA) * length * 0.55 + length * droop * 0.25;
  const pts = bezierPoints({ x: ox, y: oy }, { x: cx, y: cy }, { x: tipX, y: tipY + length * droop }, maxWidth, 0, 12);
  taperedPath(ctx, pts);
}

interface PalmOpts {
  x: number; // base of trunk
  y: number;
  scale: number; // ~1 = trunk height 220 units
  lean?: number; // degrees, trunk lean direction
  fronds?: number;
  mirror?: boolean;
}

function drawPalmOnce(ctx: CanvasRenderingContext2D, o: PalmOpts) {
  const { x, y, scale, lean = -8, fronds = 7, mirror = false } = o;
  const s = mirror ? -scale : scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s < 0 ? -1 : 1, 1);
  const trunkH = 220 * scale;
  const leanRad = (lean * Math.PI) / 180;
  const topX = Math.sin(leanRad) * trunkH * 0.5;
  const topY = -trunkH;
  const cx = Math.sin(leanRad) * trunkH * 0.22;
  const cy = -trunkH * 0.55;
  const trunkPts = bezierPoints({ x: 0, y: 0 }, { x: cx, y: cy }, { x: topX, y: topY }, 15 * scale, 6 * scale, 16);
  taperedPath(ctx, trunkPts);

  // fronds fan from the crown, asymmetric spread leaning with the trunk
  const base = -95 + lean * 1.2;
  const spread = 190;
  for (let i = 0; i < fronds; i++) {
    const t = fronds === 1 ? 0.5 : i / (fronds - 1);
    const angle = base + spread * t;
    const len = (95 + (i % 2 === 0 ? 18 : 0)) * scale;
    const w = 20 * scale;
    frond(ctx, topX, topY, angle, len, w, 0.4 + (i / fronds) * 0.25);
  }
  ctx.restore();
}

export function drawPalmSingle(ctx: CanvasRenderingContext2D, o: PalmOpts, colors: InkPair, offset = 5) {
  ctx.fillStyle = colors.light;
  drawPalmOnce(ctx, { ...o, x: o.x + offset, y: o.y + offset * 0.4 });
  ctx.fillStyle = colors.ink;
  drawPalmOnce(ctx, o);
}

/** Full-height silhouette cluster anchored to one edge — for scene backgrounds. */
export function drawPalmCluster(
  ctx: CanvasRenderingContext2D,
  originX: number,
  groundY: number,
  colors: InkPair,
  count = 3,
  baseScale = 1
) {
  const seedScales = [0.72, 1, 0.55, 0.85, 0.6];
  const seedLeans = [-14, -6, 10, -20, 4];
  const seedGaps = [0, 70, 130, 195, 250];
  for (let i = 0; i < count; i++) {
    drawPalmSingle(
      ctx,
      {
        x: originX + seedGaps[i % seedGaps.length] * baseScale,
        y: groundY,
        scale: baseScale * seedScales[i % seedScales.length],
        lean: seedLeans[i % seedLeans.length],
        fronds: 6,
      },
      colors,
      4 * baseScale
    );
  }
}

/** Three offset crested lines — not squiggles. Each wave has a small curl-back at every peak. */
export function drawWaveTriple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  ink: string,
  strokeW = 6
) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const rows = [
    { dy: 0, amp: 10, period: 90, weight: strokeW, alpha: 1 },
    { dy: 22, amp: 8, period: 90, weight: strokeW * 0.8, alpha: 0.7 },
    { dy: 42, amp: 6, period: 90, weight: strokeW * 0.6, alpha: 0.45 },
  ];
  for (const row of rows) {
    ctx.globalAlpha = row.alpha;
    ctx.lineWidth = row.weight;
    ctx.beginPath();
    const steps = Math.ceil(w / row.period);
    for (let i = 0; i <= steps; i++) {
      const px = x + i * row.period;
      const crestY = y + row.dy - row.amp;
      const troughY = y + row.dy + row.amp * 0.4;
      if (i === 0) ctx.moveTo(px, y + row.dy);
      ctx.quadraticCurveTo(px + row.period * 0.25, crestY, px + row.period * 0.5, y + row.dy);
      ctx.quadraticCurveTo(px + row.period * 0.75, troughY, px + row.period, y + row.dy);
    }
    ctx.stroke();
    // curl flick at each crest
    for (let i = 0; i <= steps; i++) {
      const px = x + i * row.period + row.period * 0.5;
      ctx.beginPath();
      ctx.moveTo(px - 6, y + row.dy - row.amp - 1);
      ctx.quadraticCurveTo(px, y + row.dy - row.amp - row.weight * 1.6, px + 7, y + row.dy - row.amp - 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Disc + tapered rays. */
export function drawSunRays(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  colors: InkPair,
  rays = 14
) {
  const draw = (color: string, dx: number, dy: number) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = color;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      const len = i % 2 === 0 ? r * 0.85 : r * 0.55;
      const w = r * 0.16;
      const bx = cx + Math.cos(a) * r * 1.08;
      const by = cy + Math.sin(a) * r * 1.08;
      const tx = cx + Math.cos(a) * (r * 1.08 + len);
      const ty = cy + Math.sin(a) * (r * 1.08 + len);
      const pts = bezierPoints({ x: bx, y: by }, { x: (bx + tx) / 2, y: (by + ty) / 2 }, { x: tx, y: ty }, w, 0, 6);
      taperedPath(ctx, pts);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  draw(colors.light, 5, 4);
  draw(colors.ink, 0, 0);
}

/** Rubber-stamp seal ring: outer dashed perimeter + tick marks, ready to hold "HH GOA" text. */
export function drawSealRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, ink: string) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.setLineDash([r * 0.09, r * 0.09]);
  ctx.lineWidth = r * 0.035;
  ctx.stroke();
  ctx.setLineDash([]);
  const ticks = 24;
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * r * 1.06;
    const y1 = cy + Math.sin(a) * r * 1.06;
    const x2 = cx + Math.cos(a) * r * 1.16;
    const y2 = cy + Math.sin(a) * r * 1.16;
    ctx.lineWidth = r * 0.02;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

/** Postage-stamp perforated frame: rounded dashes with punched-circle notches on every edge. */
export function drawPerforatedFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ink: string,
  step = 22,
  radius = 6
) {
  ctx.save();
  ctx.fillStyle = ink;
  const edges: [number, number, number, number][] = [
    [x, y, w, 0],
    [x + w, y, 0, h],
    [x + w, y + h, -w, 0],
    [x, y + h, 0, -h],
  ];
  for (const [sx, sy, dx, dy] of edges) {
    const len = Math.hypot(dx, dy);
    const count = Math.max(1, Math.round(len / step));
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      ctx.beginPath();
      ctx.arc(sx + dx * t, sy + dy * t, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawStar4pt(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, ink: string, rot = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.fillStyle = ink;
  ctx.beginPath();
  const inner = r * 0.32;
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * Math.PI * 2;
    const a1 = a0 + Math.PI / 4;
    const tx = Math.cos(a0) * r;
    const ty = Math.sin(a0) * r;
    const ix = Math.cos(a1) * inner;
    const iy = Math.sin(a1) * inner;
    if (i === 0) ctx.moveTo(tx, ty);
    else ctx.lineTo(tx, ty);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Deterministic barcode from a builder ID string — same id always draws the same bars. */
export function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, id: string, ink: string) {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 4294967296;
  };
  ctx.save();
  ctx.fillStyle = ink;
  let cx = x;
  while (cx < x + w) {
    const bw = 1 + Math.floor(rand() * 3.2);
    if (rand() > 0.42) ctx.fillRect(cx, y, bw, h);
    cx += bw + 1;
  }
  ctx.restore();
}

/** A QR-style scan mark generated from the builder ID — reads as "scan me", doesn't need to actually scan. */
export function drawQRMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, id: string, ink: string) {
  const cells = 11;
  const cell = size / cells;
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 4294967296;
  };
  ctx.save();
  ctx.fillStyle = ink;
  ctx.fillRect(x, y, size, size);
  const finder = (fx: number, fy: number) => {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + fx * cell, y + fy * cell, cell * 3, cell * 3);
    ctx.fillStyle = ink;
    ctx.fillRect(x + (fx + 0.7) * cell, y + (fy + 0.7) * cell, cell * 1.6, cell * 1.6);
    ctx.restore();
  };
  ctx.fillStyle = '#ffffff';
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const inFinderZone = (row < 3.5 && col < 3.5) || (row < 3.5 && col > cells - 4.5) || (row > cells - 4.5 && col < 3.5);
      if (inFinderZone) continue;
      if (rand() > 0.48) ctx.fillRect(x + col * cell, y + row * cell, cell * 0.92, cell * 0.92);
    }
  }
  finder(0, 0);
  finder(cells - 3, 0);
  finder(0, cells - 3);
  ctx.restore();
}

/** Lanyard clip & strap slot at the top of event passes. */
export function drawLanyardClip(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Black woven lanyard strap going up off-card
  ctx.fillStyle = '#181818';
  ctx.fillRect(-18, -60, 36, 60);

  // Metal clip ring
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -6, 12, 0, Math.PI * 2);
  ctx.stroke();

  // Swivel clip hook
  ctx.fillStyle = '#444444';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // Slot hole punched in card
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(-22, 10, 44, 12, 6);
  ctx.fill();

  ctx.restore();
}

/** Green circular "APPROVED" rubber stamp seal. */
export function drawApprovedStamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, r = 42, rot = -12) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);

  // Outer ring
  ctx.strokeStyle = '#0d6b46';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner dashed ring
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Text
  ctx.fillStyle = '#0d6b46';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(r * 0.35)}px sans-serif`;
  ctx.fillText('APPROVED', 0, 0);

  // Stars
  ctx.font = `700 ${Math.round(r * 0.2)}px sans-serif`;
  ctx.fillText('★ ★ ★', 0, -r * 0.55);
  ctx.fillText('★ ★ ★', 0, r * 0.55);

  ctx.restore();
}

/** Directional wooden signpost: BUILD, SHIP, REPEAT. */
export function drawSignpost(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Pole
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(-6, 0, 12, 110);

  // Sign 1: BUILD (Yellow)
  ctx.fillStyle = '#fbd400';
  ctx.beginPath();
  ctx.moveTo(-45, 12);
  ctx.lineTo(35, 12);
  ctx.lineTo(45, 24);
  ctx.lineTo(35, 36);
  ctx.lineTo(-45, 36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a2e12';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#0b2f1f';
  ctx.font = '900 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BUILD', -2, 28);

  // Sign 2: SHIP (Pink)
  ctx.fillStyle = '#f2226b';
  ctx.beginPath();
  ctx.moveTo(45, 42);
  ctx.lineTo(-35, 42);
  ctx.lineTo(-45, 54);
  ctx.lineTo(-35, 66);
  ctx.lineTo(45, 66);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a2e12';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SHIP', 2, 58);

  // Sign 3: REPEAT (Dark Green)
  ctx.fillStyle = '#0b2f1f';
  ctx.beginPath();
  ctx.moveTo(-45, 72);
  ctx.lineTo(35, 72);
  ctx.lineTo(45, 84);
  ctx.lineTo(35, 96);
  ctx.lineTo(-45, 96);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fbd400';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fbd400';
  ctx.font = '900 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REPEAT', -2, 88);

  ctx.restore();
}

/** Pink ribbon banner: ✦ #FRAMEINGOA ✦ */
export function drawFrameInGoaBanner(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h = 38) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = '#f2226b';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 8);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 15px sans-serif';
  ctx.fillText('✦ #FRAMEINGOA ✦', 0, 1);

  ctx.restore();
}

/** Rich Goa Beach Scenery Background (Sun, Huts, Scooter, Surfboards, Palm Trees). */
export function drawGoaBeachScenery(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { skyColor?: string; sunColor?: string; sandColor?: string; waterColor?: string } = {}
) {
  const {
    skyColor = '#0b2f1f',
    sunColor = '#ffc800',
    sandColor = '#dfba67',
    waterColor = '#105c3d',
  } = opts;

  ctx.save();

  // Ground / Water / Sand
  const horizonY = h * 0.72;
  const sandY = h * 0.82;

  ctx.fillStyle = waterColor;
  ctx.fillRect(0, horizonY, w, sandY - horizonY);

  ctx.fillStyle = sandColor;
  ctx.fillRect(0, sandY, w, h - sandY);

  // Ocean Waves
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, horizonY + 12);
  ctx.quadraticCurveTo(w * 0.25, horizonY + 4, w * 0.5, horizonY + 12);
  ctx.quadraticCurveTo(w * 0.75, horizonY + 20, w, horizonY + 12);
  ctx.stroke();

  // Sun on horizon
  ctx.fillStyle = sunColor;
  ctx.beginPath();
  ctx.arc(w * 0.5, horizonY, 44, Math.PI, Math.PI * 2);
  ctx.fill();

  // Yellow Scooter on beach
  ctx.save();
  ctx.translate(w * 0.82, sandY + 16);
  ctx.fillStyle = '#ffc800';
  ctx.beginPath();
  ctx.roundRect(-20, -12, 40, 18, 5);
  ctx.fill();
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(-14, 6, 8, 0, Math.PI * 2);
  ctx.arc(14, 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Surfboard on sand
  ctx.save();
  ctx.translate(w * 0.14, sandY + 10);
  ctx.rotate((-25 * Math.PI) / 180);
  ctx.fillStyle = '#f2226b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Beach Shack Hut on right
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(w * 0.78, horizonY - 40, 70, 40);
  ctx.fillStyle = '#f2226b';
  ctx.beginPath();
  ctx.moveTo(w * 0.76, horizonY - 40);
  ctx.lineTo(w * 0.83 + 35, horizonY - 65);
  ctx.lineTo(w * 0.78 + 76, horizonY - 40);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

