// Deterministic identity — same name+stack always issues the same builder card. No AI call, no backend.

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
  'TERMINAL WIZARD', 'CHAOS ENGINEER', 'MIDNIGHT SHIPPER', 'YAK SHAVER',
  'STACK NECROMANCER', 'PROD WHISPERER', 'CACHE INVALIDATOR', 'BUG WHISPERER',
  'FULL-SEND STACK', 'CTRL+Z SURVIVOR', 'DEMO DAY GAMBLER', 'API ALCHEMIST',
];

const CURRENTLY = [
  'BUILDING & TANNING', 'SHIPPING ON VIBES', 'DEBUGGING IN PARADISE', 'AWAKE SINCE PRE-COFFEE',
  'RUNNING ON COCONUT WATER', 'ONE COMMIT FROM DEMO', 'STILL PARSING THE BRIEF', 'ALREADY OVERSCOPED',
];

export interface Identity {
  builderId: string;
  cls: string;
  currently: string;
  seed: number;
}

export function makeIdentity(name: string, stack: string, reroll = 0): Identity {
  const key = `${name.trim().toUpperCase()}::${stack.trim().toUpperCase()}` || 'ANON::BUILDER';
  const idSeed = hashStr(key); // builder ID is stable — only the flavour text rerolls
  const rand = mulberry32(idSeed + reroll * 7919);
  const num = 1000 + Math.floor(mulberry32(idSeed)() * 8999);
  return {
    builderId: `#HH-GOA-${num}`,
    cls: BUILDER_CLASSES[Math.floor(rand() * BUILDER_CLASSES.length)],
    currently: CURRENTLY[Math.floor(rand() * CURRENTLY.length)],
    seed: idSeed,
  };
}
