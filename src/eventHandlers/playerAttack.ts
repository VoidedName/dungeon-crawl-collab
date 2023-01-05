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
import { PlayerState, PlayerStateTransitions } from '@/stateMachines/player';
import { codex } from '@/assets/codex';

export const playerAttackHandler = (mousePosition: Point, world: ECSWorld) => {
  const [player] = world.entitiesByComponent<
    [Player, Animatable, Renderable, Position]
  >([PlayerBrand, AnimatableBrand, RenderableBrand, PositionBrand]);

  if (!player) return;
  if (hasImmoveable(player)) return;

  const machine = resolveStateMachine(player.entity_id);
  if (machine.getSnapshot().value === PlayerState.ATTACKING) return;

  machine.send(PlayerStateTransitions.ATTACK);
  const sprite = resolveRenderable(player.entity_id);

  createProjectile(world, {
    firedBy: player.entity_id,
    projectile: codex.projectiles.magicMissile,
    position: { ...player.position },
    target: subVector(mousePosition, sprite.toGlobal({ x: 0, y: 0 }))
  });
};
