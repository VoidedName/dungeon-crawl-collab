import type { CodexProjectile } from '@/assets/types';
import { magicMissile } from './magic-missile';

export const projectiles = {
  magicMissile
} satisfies Record<string, CodexProjectile>;
