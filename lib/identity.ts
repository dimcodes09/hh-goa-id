// Identity generator with cool GenZ / GenAlpha builder classes & unique builder ID.

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

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

const BUILDER_CLASSES = [
  'MAX AURA SHIPPER',
  'GOATED STACK GOD',
  'NO CAP ARCHITECT',
  'SIGMA PROTOCOL DEV',
  'MAIN CHARACTER CODER',
  'RIZZ ENGINEER',
  '0X AURA NINJA',
  'TERMINAL WIZARD',
  'CHAOS ALCHEMIST',
  'PROD WHISPERER',
  'FULL-SEND MATRIX',
  'LOCK IN SPECIALIST',
  'MIDNIGHT SHIPPER',
  'GOA BEACH HACKER',
  'YAK SHAVER',
  'BUG WHISPERER',
  'API ALCHEMIST',
  'DEMO DAY GAMBLER',
];

const CURRENTLY = [
  'BUILDING & TANNING',
  'SHIPPING ON VIBES',
  'DEBUGGING IN PARADISE',
  'AWAKE SINCE PRE-COFFEE',
  'RUNNING ON COCONUT WATER',
  'ONE COMMIT FROM DEMO',
  'STILL PARSING THE BRIEF',
  'ALREADY OVERSCOPED',
];

export interface Identity {
  builderId: string;
  cls: string;
  currently: string;
  seed: number;
}

export function makeIdentity(name: string, stack: string, reroll = 0): Identity {
  const cleanName = name.trim().toUpperCase() || 'BUILDER';
  const cleanStack = stack.trim().toUpperCase() || 'FULL-STACK';
  const key = `${cleanName}::${cleanStack}::${reroll * 997}`;
  const idSeed = hashStr(key);
  const rand = mulberry32(idSeed + 1337);

  const clsIdx = Math.floor(rand() * BUILDER_CLASSES.length);
  const num = 1000 + Math.floor(rand() * 8999);

  return {
    builderId: `#HH26-${num}`,
    cls: BUILDER_CLASSES[clsIdx],
    currently: CURRENTLY[Math.floor(rand() * CURRENTLY.length)],
    seed: idSeed,
  };
}
