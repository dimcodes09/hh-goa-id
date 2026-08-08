// The signature HH Goa dot-dissolve. Every colour transition in this app is dots, never a CSS gradient.

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function lerpColor(c1: string, c2: string, t: number) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

// deterministic PRNG so a given seed always dissolves the same way (exports stay stable)
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type HalftoneAxis = 'x' | 'y' | '-x' | '-y' | 'radial' | 'radial-in';

export interface HalftoneOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  grid?: number;
  axis?: HalftoneAxis;
  maxRadius?: number;
  minRadius?: number;
  colorFrom: string;
  colorTo: string;
  jitter?: number;
  seed?: number;
  progress?: number; // 0..1 — how much of the field has "printed" (for the reveal / loader)
}

export function drawHalftone(ctx: CanvasRenderingContext2D, opts: HalftoneOptions) {
  const {
    x,
    y,
    w,
    h,
    grid = 12,
    axis = 'y',
    maxRadius = 4.5,
    minRadius = 0,
    colorFrom,
    colorTo,
    jitter = 0,
    seed = 1,
    progress = 1,
  } = opts;

  const rand = mulberry32(seed);
  const cols = Math.ceil(w / grid);
  const rows = Math.ceil(h / grid);
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const localX = i * grid + grid / 2;
      const localY = j * grid + grid / 2;
      let t: number;
      switch (axis) {
        case 'x':
          t = localX / w;
          break;
        case '-x':
          t = 1 - localX / w;
          break;
        case '-y':
          t = 1 - localY / h;
          break;
        case 'radial':
          t = Math.min(1, Math.hypot(localX - cx, localY - cy) / maxDist);
          break;
        case 'radial-in':
          t = 1 - Math.min(1, Math.hypot(localX - cx, localY - cy) / maxDist);
          break;
        default:
          t = localY / h;
      }
      if (jitter) t = Math.min(1, Math.max(0, t + (rand() - 0.5) * jitter));
      if (progress < 1 && t > progress) continue;

      const radius = minRadius + (maxRadius - minRadius) * t;
      if (radius <= 0.2) continue;
      ctx.fillStyle = lerpColor(colorFrom, colorTo, t);
      ctx.beginPath();
      ctx.arc(x + localX, y + localY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Prerender a field once and reuse — the landing shader-substitute redraws this every frame otherwise.
export function makeHalftoneTile(w: number, h: number, opts: Omit<HalftoneOptions, 'x' | 'y' | 'w' | 'h'>) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d')!;
  drawHalftone(ctx, { x: 0, y: 0, w, h, ...opts });
  return c;
}

// Subtle canvas-noise paper grain — stands in for a texture image on cream stock.
export function drawPaperGrain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed = 7, alpha = 0.05) {
  const rand = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  const dots = Math.floor((w * h) / 90);
  for (let i = 0; i < dots; i++) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const r = rand() * 0.9 + 0.3;
    ctx.fillStyle = rand() > 0.5 ? '#000000' : '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
