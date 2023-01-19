import type { Application } from 'pixi.js';
import { EventNames, type GameLoopQueue } from './createEventQueue';
import type { ECSEmitter } from './createExternalQueue';
import type { QueueEvent } from './createEventQueue';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { resolveRenderable } from '@/renderer/renderableManager';
import { isNever } from '@/utils/assertions';
import { damageHandler } from './handlers/damageHandler';
import { debugOverlayHandler } from './handlers/debugOverlayHandler';
import { dropItemHandler } from './handlers/dropItemHandler';
import { highlightInteractablesHandler } from './handlers/highlightInteractablesHandler';
import { itemHandler } from './handlers/itemHandler';
import { keyboardMovementHandler } from './handlers/keyboardMovementHandler';
import { playerAttackHandler } from './handlers/playerAttackHandler';
import { playerInteractHandler } from './handlers/playerInteractHandler';
import { setCameraOffsetHandler } from './handlers/setCameraOffsetHandler';
import { entityDiedHandler } from './handlers/entityDiedHandler';

export function createEventQueueReducer(
  world: ECSWorld,
  navigateTo: (path: string) => void,
  emit: ECSEmitter,
  app: Application
) {
  return ({ type, payload }: QueueEvent, queue: GameLoopQueue) => {
    switch (type) {
      case EventNames.KEYBOARD_MOVEMENT:
        return keyboardMovementHandler(payload, world);

      case EventNames.PLAYER_ATTACK:
        return playerAttackHandler(payload, world);

      case EventNames.PLAYER_INTERACT:
        return playerInteractHandler(payload, world, app);

      case EventNames.TOGGLE_DEBUG_OVERLAY:
        return debugOverlayHandler(payload, world);

      case EventNames.SET_CAMERA_OFFSET:
        return setCameraOffsetHandler(payload, world);

      case EventNames.DAMAGE:
        return damageHandler(payload, world, emit, queue);

      case EventNames.USE_ITEM:
        return itemHandler(payload, world, emit);

      case EventNames.DROP_ITEM:
        return dropItemHandler(payload, world, resolveRenderable);

      case EventNames.SET_HIGHLIGHT_INTERACTABLES:
        return highlightInteractablesHandler(payload, world);

      case EventNames.ENTITY_DIED:
        return entityDiedHandler(payload, world, emit, navigateTo);

      default:
        isNever(type);
    }
  };
}
