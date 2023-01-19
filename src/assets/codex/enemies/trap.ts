import type { CodexEnemy } from '@/assets/types';

export const trap = (): CodexEnemy => ({
  spriteName: 'trap',
  baseStats: {
    speed: 0,
    health: 5,
    attack: 1
  }
});
