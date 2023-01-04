import type { ECSWorld } from '../../ecs/ECSWorld';
import { renderableComponent } from '../components/Renderable';
import {
  createAnimatedSprite,
  type SpriteName
} from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { withStats } from '../components/Stats';
import { positionComponent } from '@/entity/components/Position';
import { withVelocity } from '../components/Velocity';
import { withOrientation } from '../components/Orientation';
import { poisonComponent } from '../components/Poison';

export type CreateTrapOptions = {
  spriteName: SpriteName;
};

export const createTrap = (world: ECSWorld, options: CreateTrapOptions) => {
  const sprite = createAnimatedSprite(options.spriteName, AnimationState.IDLE);

  const trap = world
    .createEntity()
    .with(positionComponent({ x: 190, y: 320 }))
    .with(withStats({ speed: 5, health: 4 }))
    .with(renderableComponent)
    .with(withOrientation(0))
    .with(withVelocity({ x: 0, y: 0 }))
    .with(withAnimatable(options.spriteName))
    .with(
      poisonComponent({
        damage: 1,
        duration: Number.POSITIVE_INFINITY,
        nextDamageIn: 1000
      })
    )
    .build();

  registerRenderable(trap.entity_id, sprite);
};
