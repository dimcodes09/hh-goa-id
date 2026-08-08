import { COLOR } from '../tokens';
import { drawModernCard, type EditionConfig } from '../render/engine';

export const postcard: EditionConfig = {
  id: 'postcard',
  label: 'POSTCARD',
  copy: 'POSTCARD — wish you were building, cream stock',
  stock: 'paper',
  swatchBg: COLOR.cream,
  swatchFg: COLOR.ink,
  aperture: { shape: 'circle', x: 0.08, y: 0.24, w: 0.38, h: 0.38 * (1600 / 2000) },
  draw(rc) {
    drawModernCard(rc, 'postcard');
  },
};
