import { scheduleAnimation } from '@/renderer/AnimationManager';
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
import type { Point } from '@/utils/types';
import { hasImmoveable } from '@/entity/components/Immoveable';

// temporary code while we don't have a proper AttackSystem
let isAttacking = false;

export const playerAttackHandler = (mousePosition: Point, world: ECSWorld) => {
  const [player] = world.entitiesByComponent<[Player, Animatable, Renderable]>([
    PlayerBrand,
    AnimatableBrand,
    RenderableBrand
  ]);

  if (!player) return;
  if (isAttacking) return;
  if (hasImmoveable(player)) return;
  isAttacking = true;

  scheduleAnimation(player.entity_id, {
    state: AnimationState.ATTACKING,
    spriteName: player.animatable.spriteName,
    loop: false,
    onExit() {
      isAttacking = false;
    }
  });
};
