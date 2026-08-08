import { EDITION_ORDER, type EditionId } from '../tokens';
import type { EditionConfig } from '../render/engine';
import { transit } from './transit';
import { postcard } from './postcard';
import { credential } from './credential';
import { sundown } from './sundown';

export const EDITIONS: Record<EditionId, EditionConfig> = { transit, postcard, credential, sundown };
export const EDITIONS_LIST: EditionConfig[] = EDITION_ORDER.map((id) => EDITIONS[id]);
