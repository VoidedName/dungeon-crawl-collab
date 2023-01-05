import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  AnimatableBrand,
  AnimationState,
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
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import {
  VelocityBrand,
  type Velocity,
  velocityComponent
} from '@/entity/components/Velocity';
import { getAnimationState } from '@/renderer/AnimationManager';
import {
  entityToRect,
  getAnimationDuration,
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
import { deleteComponent } from '@/entity/components/Delete';
import {
  StateAwareBrand,
  type StateAware
} from '@/entity/components/StateAware';
import { ProjectileStateTransitions } from '@/stateMachines/projectile';

export const MovementSystem: () => ECSSystem<
  [Position, Velocity, Stats, Orientation, Size, StateAware, Animatable]
> = () => ({
  target: [
    PositionBrand,
    VelocityBrand,
    StatsBrand,
    OrientationBrand,
    SizeBrand,
    StateAwareBrand,
    AnimatableBrand
  ],
  run: (world, props, entities) => {
    const collidables = world.entitiesByComponent<[Collidable, Size, Position]>(
      [CollidableBrand, SizeBrand, PositionBrand]
    );

    entities.forEach(e => {
      if (hasImmoveable(e)) {
        return;
      }
      const machine = resolveStateMachine(e.entity_id);

      if (hasPlayer(e) && machine.getSnapshot().value !== PlayerState.RUNNING)
        return;
      if (hasProjectile(e) && machine.getSnapshot().value !== PlayerState.IDLE)
        return;

      const getHitbox = () =>
        getSpriteHitbox({
          entity: e,
          hitboxId: HitBoxId.BODY_COLLISION,
          animationState: getAnimationState(e.entity_id)!
        });

      // snap back position to closest safe spot, to avoid getting stuck in a wall
      // this involves getting the potential overlaps with a collidable, in all 4 directions
      // then applying the minimal corrections possible to fix potential issues
      // there are a few cases this doesnt covers for now
      // - correcting in both the horizontal and vertical axis: potentially we could get stuck in a corner ? I guess fixing one direction should be enough
      // - having a large sprite going completely through a collidable: the directionAware collision check does not cover it because skill issue on my part è_é
      for (const collidable of collidables) {
        const { left, right, up, down } = directionAwareRectRectCollision(
          getHitbox(),
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

      e.position = addVector(e.position, { x: e.velocity.x, y: e.velocity.y });
      for (const collidable of collidables) {
        if (rectRectCollision(getHitbox(), entityToRect(collidable))) {
          if (hasPlayer(e)) {
            Object.assign(
              e.position,
              subVector(e.position, {
                x: e.velocity.x,
                y: e.velocity.y
              })
            );
          }
          if (hasProjectile(e)) {
            machine.send(ProjectileStateTransitions.DIE);
            setTimeout(() => {
              world.addComponent(e.entity_id, deleteComponent);
            }, getAnimationDuration(e.animatable.spriteName, AnimationState.DEAD));
          }
        }
      }
    });
  }
});
