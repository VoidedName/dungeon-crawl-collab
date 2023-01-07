import type { ECSComponent } from '@/ecs/ECSComponent';
import type { Point, Rectangle } from '@/utils/types';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { Maybe } from '@/utils/Maybe';

/**
 * movement - physical space taken up by the sprite for movement calculations.
 * damage - box used to detect if this does damage to something else
 * hurt - box used to detect if this is getting damaged
 */
export type HitBoxes = ECSComponent<
  'hitboxes',
  {
    movement: Maybe<Rectangle>;
    damage: Maybe<Rectangle>;
    hurt: Maybe<Rectangle>;
  }
>;
export const hasHitboxes = has<HitBoxes>('hitboxes');
export const hitboxes = ecsComponent<HitBoxes>('hitboxes');
