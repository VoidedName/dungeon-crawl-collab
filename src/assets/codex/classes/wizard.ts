import type { CodexPlayerClass } from '@/assets/types';

export const wizard = (): CodexPlayerClass => ({
  spriteName: 'wizard',
  baseStats: {
    speed: 3,
    health: 10
  }
});
