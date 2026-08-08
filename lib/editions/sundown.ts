import { COLOR } from '../tokens';
import { drawModernCard, type EditionConfig } from '../render/engine';

export const sundown: EditionConfig = {
  id: 'sundown',
  label: 'SUNDOWN',
  copy: 'SUNDOWN — dusk festival pass, lime & ink press',
  stock: 'press',
  swatchBg: COLOR.lime,
  swatchFg: COLOR.ink,
  aperture: { shape: 'circle', x: 0.5 - 0.19, y: 0.22, w: 0.38, h: 0.38 * (1600 / 2000) },
  draw(rc) {
    drawModernCard(rc, 'sundown');
  },
};
