import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  type Animatable,
  AnimatableBrand,
  hasAnimatable
} from '@/entity/components/Animatable';
import { deleteComponent } from '@/entity/components/Delete';
import { hasEnemy } from '@/entity/components/Enemy';
import { hasPlayer } from '@/entity/components/Player';
import {
  hasPosition,
  type Position,
  PositionBrand
} from '@/entity/components/Position';
import {
  type Projectile,
  ProjectileBrand
} from '@/entity/components/Projectile';
import { hasSize, type Size, SizeBrand } from '@/entity/components/Size';
import {
  type StateAware,
  StateAwareBrand
} from '@/entity/components/StateAware';
import { ProjectileState } from '@/stateMachines/projectile';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { getIntersectingTiles, spriteCollision } from '@/utils/collisions';
import { dealDamage, removeProjectile } from '@/utils/ecsUtils';
import type { GameMap } from '@/map/Map';
import type { ECSEntityId } from '@/ecs/ECSEntity';

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
    const map = ecs.get<GameMap>('map').unwrap();
    entities.forEach(e => {
      const machine = resolveStateMachine(e.entity_id);
      if (machine.getSnapshot().value === ProjectileState.DEAD) return;

      ecs.getEntity(e.projectile.firedBy).match(
        owner => {
          if (hasPlayer(owner)) {
            const candidateIds = new Set<ECSEntityId>();
            for (const [x, y] of getIntersectingTiles(e, map)) {
              map.getEntities(x, y).forEach(e => candidateIds.add(e));
            }

            const enemies = [...candidateIds]
              .map(e => ecs.getEntity(e).unwrap())
              .filter(hasEnemy)
              .filter(hasPosition)
              .filter(hasAnimatable)
              .filter(hasSize);

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
