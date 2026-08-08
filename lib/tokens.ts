// HH Goa 2026 — Stamp Office design tokens
// Pulled from the approved prototype (Goa Stamp Office design flow). Single source of truth.

export const COLOR = {
  ink: '#0B2F1F',
  green: '#0F5132',
  greenMid: '#4A7A24',
  lime: '#A8C023',
  yellow: '#FFD400',
  yellowDeep: '#F0B429',
  pink: '#F2226B',
  cream: '#FBF3DE',
  creamShade: '#F0E4C6',
  teal: '#2EC4B6',
} as const;

export type ColorToken = keyof typeof COLOR;

export const FONT = {
  display: "'Bodoni Moda', serif", // 900 weight — card names, hero type
  mono: "'Space Mono', monospace", // metadata, labels, UI chrome text
  script: "'Kalam', cursive", // गोवा only
  chrome: "'Nunito Sans', sans-serif", // app UI only — never on a card
} as const;

export const EVENT = {
  name: 'HACKER गोवा HOUSE',
  location: 'GOA, INDIA',
  dates: '28–31 OCT 2026',
  year: '2026',
  hashtag: '#FrameInGoa',
  studio: '2:47pm STUDIO',
};

// Canvas export spec
export const CARD_W = 1600;
export const CARD_H = 2000;
export const SAFE_MARGIN = 96;
export const PFP_SIZE = 1080;

export type Stock = 'paper' | 'press';

export type EditionId = 'transit' | 'postcard' | 'credential' | 'sundown';

export const EDITION_ORDER: EditionId[] = ['transit', 'postcard', 'credential', 'sundown'];
