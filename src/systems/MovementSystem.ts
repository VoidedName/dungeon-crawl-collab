import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  type Animatable,
  AnimatableBrand
} from '@/entity/components/Animatable';
import { type Collidable, hasCollidable } from '@/entity/components/Collidable';
import { hasImmoveable } from '@/entity/components/Immoveable';
import {
  type Orientation,
  OrientationBrand
} from '@/entity/components/Orientation';
import { type Position, PositionBrand } from '@/entity/components/Position';
import { type Size, SizeBrand } from '@/entity/components/Size';
import { type Velocity, VelocityBrand } from '@/entity/components/Velocity';
import {
  directionAwareRectRectCollision,
  getIntersectingTiles,
  rectRectCollision
} from '@/utils/collisions';
import { addVector, subVector } from '@/utils/vectors';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { PlayerState } from '@/stateMachines/player';
import { hasPlayer } from '@/entity/components/Player';
import { hasProjectile } from '@/entity/components/Projectile';
import {
  type StateAware,
  StateAwareBrand
} from '@/entity/components/StateAware';
import { ProjectileState } from '@/stateMachines/projectile';
import { removeProjectile } from '@/utils/ecsUtils';
import type { HitBoxes } from '@/entity/components/HitBoxes';
import { hasHitboxes } from '@/entity/components/HitBoxes';
import type { ECSEntity, ECSEntityId } from '@/ecs/ECSEntity';
import type { GameMap } from '@/map/Map';
import type { Intersect } from '@/utils/types';

export const MovementSystem: () => ECSSystem<
  [Position, Velocity, Orientation, Size, StateAware, Animatable, HitBoxes]
> = () => ({
  target: [
    PositionBrand,
    VelocityBrand,
    OrientationBrand,
    SizeBrand,
    StateAwareBrand,
    AnimatableBrand,
    'hitboxes'
  ],
  run: (world, props, entities) => {
    const handleSnapback = (
      e: typeof entities[number],
      colliders: Iterable<ECSEntity & Intersect<[Collidable]>>
    ) => {
      for (const collidable of colliders) {
        if (hasHitboxes(collidable)) {
          const { left, right, up, down } = directionAwareRectRectCollision(
            e.hitboxes.movement.unwrap(),
            collidable.hitboxes.movement.unwrap()
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
      }
    };

    const handleProjectileMovement = (
      e: typeof entities[number],
      colliders: Iterable<ECSEntity & Intersect<[Collidable]>>
    ) => {
      if (!hasProjectile(e)) return;
      const machine = resolveStateMachine(e.entity_id);
      const state = machine.getSnapshot().value;

      if (state !== ProjectileState.IDLE) return;

      e.position = addVector(e.position, {
        x: e.velocity.x,
        y: e.velocity.y
      });
      for (const collidable of colliders) {
        if (hasHitboxes(collidable)) {
          if (
            rectRectCollision(
              collidable.hitboxes.movement.unwrap(),
              e.hitboxes.movement.unwrap()
            )
          ) {
            if (machine.getSnapshot().value === ProjectileState.DEAD) return;
            removeProjectile(e, world);
            break;
          }
        }
      }
    };

    const handlePlayerMovement = (
      e: typeof entities[number],
      colliders: Iterable<ECSEntity & Intersect<[Collidable]>>
    ) => {
      if (!hasPlayer(e)) return;

      const machine = resolveStateMachine(e.entity_id);
      const state = machine.getSnapshot().value;
      if (state !== PlayerState.RUNNING) return;

      e.position = addVector(e.position, { x: e.velocity.x, y: 0 });
      for (const collidable of colliders) {
        if (hasHitboxes(collidable)) {
          if (
            rectRectCollision(
              collidable.hitboxes.movement.unwrap(),
              e.hitboxes.movement.unwrap()
            )
          ) {
            e.position = subVector(e.position, { x: e.velocity.x, y: 0 });
            break;
          }
        }
      }

      e.position = addVector(e.position, { x: 0, y: e.velocity.y });
      for (const collidable of colliders) {
        if (hasHitboxes(collidable)) {
          if (
            rectRectCollision(
              collidable.hitboxes.movement.unwrap(),
              e.hitboxes.movement.unwrap()
            )
          ) {
            e.position = subVector(e.position, { x: 0, y: e.velocity.y });
          }
        }
      }
    };

    const map = world.get<GameMap>('map').unwrap();
    entities.forEach(e => {
      if (hasImmoveable(e)) {
        return;
      }

      const candidateIds = new Set<ECSEntityId>();
      for (const [x, y] of getIntersectingTiles(e, map)) {
        map.getEntities(x, y).forEach(e => candidateIds.add(e));
      }

      const colliders = [...candidateIds]
        .map(e => world.getEntity(e).unwrap())
        .filter(hasCollidable);

      if (e.hitboxes.movement.isSome()) {
        handleSnapback(e, colliders);
        handlePlayerMovement(e, colliders);
      }
      if (hasProjectile(e)) {
        handleProjectileMovement(e, colliders);
      }
    });
  }
});
