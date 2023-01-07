import type { CodexItem } from '@/assets/types';
import { healthPotion } from './health-potion';

export const items = {
  healthPotion
} satisfies Record<string, () => CodexItem>;
