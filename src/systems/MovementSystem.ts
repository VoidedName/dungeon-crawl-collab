import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import {
  CollidableBrand,
  type Collidable
} from '@/entity/components/Collidable';
import { hasImmoveable } from '@/entity/components/Immoveable';
import {
  OrientationBrand,
  type Orientation
} from '@/entity/components/Orientation';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { SizeBrand, type Size } from '@/entity/components/Size';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import { getAnimationState } from '@/renderer/AnimationManager';
import {
  entityToRect,
  getSpriteHitbox,
  HitBoxId
} from '@/renderer/renderableUtils';
import {
  directionAwareRectRectCollision,
  rectRectCollision
} from '@/utils/collisions';
import { addVector, subVector } from '@/utils/vectors';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { PlayerState } from '@/stateMachines/player';
import { hasPlayer } from '@/entity/components/Player';
import { hasProjectile } from '@/entity/components/Projectile';
import {
  StateAwareBrand,
  type StateAware
} from '@/entity/components/StateAware';
import {
  ProjectileState,
  ProjectileStateTransitions
} from '@/stateMachines/projectile';
import { removeProjectile } from '@/utils/ecsUtils';

export const MovementSystem: () => ECSSystem<
  [Position, Velocity, Orientation, Size, StateAware, Animatable]
> = () => ({
  target: [
    PositionBrand,
    VelocityBrand,
    OrientationBrand,
    SizeBrand,
    StateAwareBrand,
    AnimatableBrand
  ],
  run: (world, props, entities) => {
    const collidables = world.entitiesByComponent<[Collidable, Size, Position]>(
      [CollidableBrand, SizeBrand, PositionBrand]
    );

    const getHitbox = (e: typeof entities[number]) =>
      getSpriteHitbox({
        entity: e,
        hitboxId: HitBoxId.BODY_COLLISION,
        animationState: getAnimationState(e.entity_id)!
      });

    const handleSnapback = (e: typeof entities[number]) => {
      for (const collidable of collidables) {
        const { left, right, up, down } = directionAwareRectRectCollision(
          getHitbox(e),
          entityToRect(collidable)
        );
        const horizontalCorrection = left > right ? -left : right;
        const verticalCorrection = up > down ? -up : down;
        if (horizontalCorrection === 0 && verticalCorrection === 0) continue;

        if (Math.abs(horizontalCorrection) < Math.abs(verticalCorrection)) {
          e.position.x += horizontalCorrection;
        } else {
          e.position.y += verticalCorrection;
        }
      }
    };

    const handleProjectileMovement = (e: typeof entities[number]) => {
      if (!hasProjectile(e)) return;

      const machine = resolveStateMachine(e.entity_id);
      const state = machine.getSnapshot().value;

      if (state !== ProjectileState.IDLE) return;

      e.position = addVector(e.position, {
        x: e.velocity.x,
        y: e.velocity.y
      });
      for (const collidable of collidables) {
        if (rectRectCollision(entityToRect(collidable), getHitbox(e))) {
          if (machine.getSnapshot().value === ProjectileState.DEAD) return;
          removeProjectile(e, world);
          break;
        }
      }
    };

    const handlePlayerMovement = (e: typeof entities[number]) => {
      if (hasPlayer(e)) return;

      const machine = resolveStateMachine(e.entity_id);
      const state = machine.getSnapshot().value;
      if (state !== PlayerState.RUNNING) return;

      e.position = addVector(e.position, { x: e.velocity.x, y: 0 });
      for (const collidable of collidables) {
        if (rectRectCollision(entityToRect(collidable), getHitbox(e))) {
          e.position = subVector(e.position, { x: e.velocity.x, y: 0 });
          break;
        }
      }

      e.position = addVector(e.position, { x: 0, y: e.velocity.y });
      for (const collidable of collidables) {
        if (rectRectCollision(entityToRect(collidable), getHitbox(e))) {
          e.position = subVector(e.position, { x: 0, y: e.velocity.y });
        }
      }
    };

    entities.forEach(e => {
      if (hasImmoveable(e)) {
        return;
      }

      handleSnapback(e);
      handlePlayerMovement(e);
      handleProjectileMovement(e);
    });
  }
});
