import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  AnimatableBrand,
  type Animatable,
  AnimationState
} from '@/entity/components/Animatable';
import { deleteComponent } from '@/entity/components/Delete';
import { EnemyBrand, type Enemy } from '@/entity/components/Enemy';
import { hasPlayer } from '@/entity/components/Player';
import { PositionBrand, type Position } from '@/entity/components/Position';
import {
  ProjectileBrand,
  type Projectile
} from '@/entity/components/Projectile';
import { SizeBrand, type Size } from '@/entity/components/Size';
import {
  StateAwareBrand,
  type StateAware
} from '@/entity/components/StateAware';
import { getAnimationState } from '@/renderer/AnimationManager';
import {
  HitBoxId,
  getAnimationDuration,
  getSpriteHitbox
} from '@/renderer/renderableUtils';
import {
  ProjectileState,
  ProjectileStateTransitions
} from '@/stateMachines/projectile';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { spriteCollision } from '@/utils/collisions';
import { dealDamage, removeProjectile } from '@/utils/ecsUtils';
import { clamp } from '@/utils/math';

export const ProjectileSystem: () => ECSSystem<
  [Projectile, Position, Size, Animatable, StateAware]
> = () => ({
  target: [
    ProjectileBrand,
    PositionBrand,
    SizeBrand,
    AnimatableBrand,
    StateAwareBrand
  ],
  run: (ecs, props, entities) => {
    entities.forEach(e => {
      const machine = resolveStateMachine(e.entity_id);
      if (machine.getSnapshot().value === ProjectileState.DEAD) return;

      ecs.getEntity(e.projectile.firedBy).match(
        owner => {
          if (hasPlayer(owner)) {
            const enemies = ecs.entitiesByComponent<
              [Enemy, Position, Animatable, Size]
            >([EnemyBrand, PositionBrand, AnimatableBrand, SizeBrand]);

            enemies.forEach(enemy => {
              if (!spriteCollision(e, enemy)) return;
              dealDamage({
                to: enemy,
                amount: e.projectile.stats.current.power,
                ecs
              });

              removeProjectile(e, ecs);
            });
          }
        },
        () => {
          console.warn('could not find owner of entity', e.entity_id);
          ecs.addComponent(e, deleteComponent);
        }
      );
    });
  }
});
