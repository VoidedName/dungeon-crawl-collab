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
import type { PlayerClass } from '@/assets/types';

export type CreatePlayerOptions = {
  playerClass: PlayerClass;
};

export type PlayerEntity = ReturnType<typeof createPlayer>;
export const createPlayer = (
  world: ECSWorld,
  { playerClass }: CreatePlayerOptions
) => {
  const sprite = createAnimatedSprite(
    playerClass.spriteName,
    AnimationState.IDLE
  );
  sprite.zIndex = 1;

  const player = world
    .createEntity()
    .with(playerComponent)
    .with(renderableComponent)
    .with(stateAwareComponent)
    .with(positionComponent({ x: 200, y: 100 }))
    .with(sizeComponent({ w: 64, h: 64 }))
    .with(withStats(playerClass.baseStats))
    .with(velocityComponent({ x: 0, y: 0 }))
    .with(withOrientation(0))
    .with(withAnimatable(playerClass.spriteName))
    .with(withInteractIntent())
    .build();

  registerRenderable(player.entity_id, sprite);
  registerStateMachine(
    player.entity_id,
    createPlayerStateMachine(player, world)
  );

  return player;
};
