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
import { dealDamage } from '@/utils/ecsUtils';

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

  dealDamage({
    to: player,
    amount: damage,
    ecs: world
  });

  if (player.player.stats.current.health <= 0) {
    alert('you dead');
    navigateTo('/');
  }
};
