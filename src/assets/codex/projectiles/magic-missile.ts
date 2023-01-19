import type { CodexProjectile } from '@/assets/types';

export const magicMissile = (): CodexProjectile => ({
  spriteName: 'magicMissile',
  baseStats: {
    speed: 3,
    power: 0
  }
});
