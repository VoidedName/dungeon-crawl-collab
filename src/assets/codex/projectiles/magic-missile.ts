import type { CodexProjectile } from '@/assets/types';

export const magicMissile = (): CodexProjectile => ({
  spriteName: 'magicMissile',
  baseStats: {
    speed: 10,
    power: 0
  }
});
