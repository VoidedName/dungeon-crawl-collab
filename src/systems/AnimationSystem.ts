import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import type { RenderableId } from '@/renderer/renderableCache';
import type { AnimatedSprite } from 'pixi.js';
import { updateTextures } from '@/renderer/createAnimatedSprite';

export const AnimationSystem: (
  resolveSprite: (sprite: RenderableId) => AnimatedSprite
) => ECSSystem<[Animatable, Renderable]> = resolveSprite => ({
  target: [AnimatableBrand, RenderableBrand],
  run: entities => {
    entities.forEach(e => {
      const sprite = resolveSprite(e.renderable.sprite);

      if (!e.animatable.isDirty) return;
      e.animatable.isDirty = false;

      sprite.loop = e.animatable.options.loop;
      sprite.onComplete = () => {
        if (!e.animatable.options.fallbackOnComplete) return;
        e.animatable.state = e.animatable.options.fallbackOnComplete;
        e.animatable.options.loop = true;
        e.animatable.options.fallbackOnComplete = null;
      };

      updateTextures(
        e.renderable.sprite,
        e.animatable.spriteName,
        e.animatable.state
      );
    });
  }
});
