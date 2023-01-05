import type { ECSWorld } from '../../ecs/ECSWorld';
import { playerComponent } from '../components/Player';
import { velocityComponent } from '../components/Velocity';
import {
  createAnimatedSprite,
  type SpriteName
} from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { withStats } from '../components/Stats';
import { withOrientation } from '../components/Orientation';
import { withInteractIntent } from '../components/InteractIntent';
import { positionComponent } from '@/entity/components/Position';
import { renderableComponent } from '../components/Renderable';
import { stateAwareComponent } from '../components/StateAware';
import { registerStateMachine } from '../../stateMachines/stateMachineManager';
import { createPlayerStateMachine } from '../../stateMachines/player';
import { sizeComponent } from '../components/Size';

export type CreatePlayerOptions = {
  spriteName: SpriteName;
};

export type PlayerEntity = ReturnType<typeof createPlayer>;
export const createPlayer = (world: ECSWorld, options: CreatePlayerOptions) => {
  const sprite = createAnimatedSprite(options.spriteName, AnimationState.IDLE);
  sprite.zIndex = 1;

  const player = world
    .createEntity()
    .with(playerComponent)
    .with(renderableComponent)
    .with(stateAwareComponent)
    .with(positionComponent({ x: 200, y: 100 }))
    .with(sizeComponent({ w: 64, h: 64 }))
    .with(withStats({ speed: 5, health: 10 }))
    .with(velocityComponent({ x: 0, y: 0 }))
    .with(withOrientation(0))
    .with(withAnimatable(options.spriteName))
    .with(withInteractIntent())
    .build();

  registerRenderable(player.entity_id, sprite);
  registerStateMachine(
    player.entity_id,
    createPlayerStateMachine(player, world)
  );

  return player;
};
