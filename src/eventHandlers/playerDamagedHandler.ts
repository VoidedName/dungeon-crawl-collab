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
import { PlayerStateTransitions } from '@/stateMachines/player';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { clamp } from '@/utils/math';

export const playerDamagedHandler = (
  damage: number,
  world: ECSWorld,
  navigateTo: (path: string) => void
) => {
  const [player] = world.entitiesByComponent<[Player, Renderable, Animatable]>([
    PlayerBrand,
    RenderableBrand,
    AnimatableBrand
  ]);
  if (!player) return;

  player.player.stats.current.health = clamp(
    player.player.stats.current.health - damage,
    0,
    player.player.stats.base.health
  );

  const machine = resolveStateMachine(player.entity_id);
  machine.send(PlayerStateTransitions.TAKE_DAMAGE);

  if (player.player.stats.current.health <= 0) {
    // alert('you dead');
    // navigateTo('/');
  }
};
