import type { ECSSystem } from '@/ecs/ECSSystem';
import { RenderableBrand, type Renderable } from '@/entity/Renderable';
import { AnimatableBrand, type Animatable } from '@/entity/Animatable';
import type { SpriteWrapper } from '@/renderer/createSprite';

export const AnimationSystem: (
  resolveSprite: (sprite: number) => SpriteWrapper
) => ECSSystem<[Animatable, Renderable]> = resolveSprite => ({
  target: [AnimatableBrand, RenderableBrand],
  run: entities => {
    entities.forEach(e => {
      const { scheduleTransition, flushTransition } = resolveSprite(
        e.renderable.sprite
      );

      scheduleTransition({ state: e.animatable.animationState });
      flushTransition();
    });
  }
});
