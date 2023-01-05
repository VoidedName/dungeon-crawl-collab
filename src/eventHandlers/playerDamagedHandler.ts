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
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { PlayerStateTransitions } from '@/stateMachines/player';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { clamp } from '@/utils/math';

export const playerDamagedHandler = (
  damage: number,
  world: ECSWorld,
  navigateTo: (path: string) => void
) => {
  const [player] = world.entitiesByComponent<
    [Player, Stats, Renderable, Animatable]
  >([PlayerBrand, StatsBrand, RenderableBrand, AnimatableBrand]);
  if (!player) return;

  player.stats.current.health = clamp(
    player.stats.current.health - damage,
    0,
    player.stats.base.health
  );

  const machine = resolveStateMachine(player.entity_id);
  machine.send(PlayerStateTransitions.TAKE_DAMAGE);

  if (player.stats.current.health <= 0) {
    alert('you dead');
    navigateTo('/');
  }
};
