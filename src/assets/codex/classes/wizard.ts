import type { CodexPlayerClass } from '@/assets/types';
import { experienceTable } from '../resources/expTable';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const wizard = (): CodexPlayerClass => ({
  spriteName: 'wizard',
  className: 'Wizard',
  baseStats: {
    speed: 3.25,
    health: 6,
    attack: 1,
    level: 1,
    experience: 0,
    experienceToNextLevel: experienceTable[2]
  },
  statGrowth: {
    health: 1,
    attack: 1
  }
});
