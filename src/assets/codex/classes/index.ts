import type { PlayerClass } from '@/assets/types';
import { wizard } from './wizard';

export const playerClasses = {
  wizard
} satisfies Record<string, PlayerClass>;
