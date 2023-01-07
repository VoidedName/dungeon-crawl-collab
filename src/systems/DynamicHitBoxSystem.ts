import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Position } from '@/entity/components/Position';
import type { Size } from '@/entity/components/Size';
import { getSpriteHitbox, HitBoxId } from '@/renderer/renderableUtils';
import { getAnimationState } from '@/renderer/AnimationManager';
import type { Animatable } from '@/entity/components/Animatable';
import { hasHitboxes, hitboxes } from '@/entity/components/HitBoxes';
import { some } from '@/utils/Maybe';

export const DynamicHitBoxSystem: ECSSystem<[Position, Animatable, Size]> = {
  target: ['position', 'animatable', 'size'],
  run: (w, p, entities) => {
    entities.forEach(e => {
      const animationState = getAnimationState(e.entity_id);
      if (animationState === undefined || animationState === null) return;
      // TODO: get other hitbox data?
      const hitbox = getSpriteHitbox({
        entity: e,
        hitboxId: HitBoxId.BODY_COLLISION,
        animationState
      });
      if (!hasHitboxes(e)) {
        w.addComponent(
          e,
          hitboxes({
            hurt: some(hitbox),
            damage: some(hitbox),
            movement: some(hitbox)
          })
        );
      } else {
        e.hitboxes.movement = some(hitbox);
        e.hitboxes.damage = some(hitbox);
        e.hitboxes.hurt = some(hitbox);
      }
    });
  }
};
