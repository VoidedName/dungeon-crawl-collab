import { getEntityById } from '@/EntityManager';
import type { TPlayerEntity } from '@/PlayerEntity';

export type SpriteId = number;

export const resolveSprite = (id: number) => {
  return (getEntityById(id)! as unknown as TPlayerEntity).sprite;
};
