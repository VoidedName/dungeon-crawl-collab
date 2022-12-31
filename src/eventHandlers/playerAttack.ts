import type { ECSWorld } from '@/ecs/ECSWorld';
import {
  AnimatableBrand,
  type Animatable,
  AnimationState
} from '@/entity/components/Animatable';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import { objectAssign } from '@/utils/helpers';
import type { Point } from '@/utils/types';

export const playerAttackHandler = (mousePosition: Point, world: ECSWorld) => {
  const [player] = world.entitiesByComponent<[Player, Animatable, Renderable]>([
    PlayerBrand,
    AnimatableBrand,
    RenderableBrand
  ]);

  if (!player) return;

  player.animatable.state = AnimationState.ATTACKING;
  objectAssign(player.animatable.options, {
    loop: false,
    fallbackOnComplete: AnimationState.IDLE
  });
};
