import type { CodexPlayerClass } from '@/assets/types';
import { wizard } from './wizard';

export const playerClasses = {
  wizard
} satisfies Record<string, () => CodexPlayerClass>;
