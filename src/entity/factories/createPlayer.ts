import type { ECSWorld } from '../../ecs/ECSWorld';
import { playerComponent } from '../components/Player';
import { velocityComponent } from '../components/Velocity';
import { createAnimatedSprite } from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { withOrientation } from '../components/Orientation';
import { withInteractIntent } from '../components/InteractIntent';
import { positionComponent } from '@/entity/components/Position';
import { renderableComponent } from '../components/Renderable';
import { stateAwareComponent } from '../components/StateAware';
import { registerStateMachine } from '../../stateMachines/stateMachineManager';
import { createPlayerStateMachine } from '../../stateMachines/player';
import { sizeComponent } from '../components/Size';
import type { CodexPlayerClass } from '@/assets/types';
import { spriteLayer } from '@/renderer/createGameRenderer';

export type CreatePlayerOptions = {
  playerClass: CodexPlayerClass;
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
  sprite.parentLayer = spriteLayer;

  const player = world
    .createEntity()
    .with(
      playerComponent({
        stats: {
          base: playerClass.baseStats,
          current: { ...playerClass.baseStats }
        },
        playerClass
      })
    )
    .with(renderableComponent)
    .with(stateAwareComponent)
    .with(positionComponent({ x: 200, y: 100 }))
    .with(sizeComponent({ w: 64, h: 64 }))
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
