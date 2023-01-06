import type { CodexEnemy } from '@/assets/types';
import { trap } from './trap';

export const enemies = {
  trap
} satisfies Record<string, () => CodexEnemy>;
