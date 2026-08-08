import { COLOR } from '../tokens';
import { drawModernCard, type EditionConfig } from '../render/engine';

export const transit: EditionConfig = {
  id: 'transit',
  label: 'TRANSIT',
  copy: 'TRANSIT — luggage tag pass, green press',
  stock: 'press',
  swatchBg: COLOR.green,
  swatchFg: COLOR.yellow,
  aperture: { shape: 'rounded', x: 0.08, y: 0.22, w: 0.38, h: 0.38 * (1600 / 2000), radius: 0.03 },
  draw(rc) {
    drawModernCard(rc, 'transit');
  },
};
