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
import { PlayerStateTransitions } from '@/stateMachines/player';

export const playerAttackHandler = (mousePosition: Point, world: ECSWorld) => {
  const [player] = world.entitiesByComponent<[Player, Animatable, Renderable]>([
    PlayerBrand,
    AnimatableBrand,
    RenderableBrand
  ]);

  if (!player) return;
  if (hasImmoveable(player)) return;

  const machine = resolveStateMachine(player.entity_id);

  machine.send(PlayerStateTransitions.ATTACK);
};
