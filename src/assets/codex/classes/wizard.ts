import type { CodexPlayerClass } from '@/assets/types';

export const wizard = (): CodexPlayerClass => ({
  spriteName: 'wizard',
  baseStats: {
    speed: 3.25,
    health: 10,
    attack: 1,
    level: 0,
    experience: 0,
    experienceToNextLevel: 100
  }
});
