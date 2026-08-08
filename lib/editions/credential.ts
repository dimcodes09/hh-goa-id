import { COLOR } from '../tokens';
import { drawModernCard, type EditionConfig } from '../render/engine';

export const credential: EditionConfig = {
  id: 'credential',
  label: 'CREDENTIAL',
  copy: 'CREDENTIAL — official lanyard badge, cream stock',
  stock: 'paper',
  swatchBg: COLOR.cream,
  swatchFg: COLOR.green,
  aperture: { shape: 'circle', x: 0.08, y: 0.28, w: 0.38, h: 0.38 * (1600 / 2000) },
  draw(rc) {
    drawModernCard(rc, 'credential');
  },
};
