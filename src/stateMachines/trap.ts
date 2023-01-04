import type { Values } from '@/utils/types';

export const TrapState = {
  IDLE: 'idle',
  FIRED: 'fired'
} as const;
export type TrapState = Values<typeof TrapState>;
