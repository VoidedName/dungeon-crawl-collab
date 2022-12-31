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
      const { transitionTo, currentAnimation } = resolveSprite(
        e.renderable.sprite
      );
      if (e.animatable.state === currentAnimation) return;

      transitionTo(e.animatable.state, sprite => {
        sprite.loop = e.animatable.options.loop;
        sprite.onComplete = () => {
          if (!e.animatable.options.fallbackOnComplete) return;

          e.animatable.state = e.animatable.options.fallbackOnComplete;
          e.animatable.options.loop = true;
          e.animatable.options.fallbackOnComplete = null;
        };
      });
    });
  }
});
