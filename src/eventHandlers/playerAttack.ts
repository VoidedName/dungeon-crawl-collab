import type { ECSWorld } from '@/ecs/ECSWorld';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import type { Point } from '@/utils/types';
import { hasImmoveable } from '@/entity/components/Immoveable';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { createProjectile } from '@/entity/factories/createProjectile';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { subVector } from '@/utils/vectors';
import { resolveRenderable } from '@/renderer/renderableManager';

export const playerAttackHandler = (mousePosition: Point, world: ECSWorld) => {
  const [player] = world.entitiesByComponent<
    [Player, Animatable, Renderable, Position]
  >([PlayerBrand, AnimatableBrand, RenderableBrand, PositionBrand]);

  if (!player) return;
  if (hasImmoveable(player)) return;

  const machine = resolveStateMachine(player.entity_id);
  const sprite = resolveRenderable(player.entity_id);

  const projectile = createProjectile(world, {
    spriteName: 'magicMissile',
    position: { ...player.position },
    target: subVector(mousePosition, player.position)
  });
};
