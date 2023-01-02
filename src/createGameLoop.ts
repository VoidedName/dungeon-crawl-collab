import type { Application } from 'pixi.js';
import { createWorld, type ECSWorld } from '@/ecs/ECSWorld';
import { isNever } from './utils/assertions';
import type { Point, Values } from './utils/types';

import { loadMap, type TMap } from './MapManager';
import { resolveSprite } from './renderer/renderableCache';
import { createEventQueue, type EventQueue } from './createEventQueue';
import { createPlayer } from './createPlayer';
import { createControls } from './createControls';

import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { CameraSystem } from './systems/CameraSystem';
import { InteractionSystem } from './systems/InteractionSystem';
import { debugOverlayHandler } from '@/eventHandlers/debugOverlayHandler';

import {
  type Directions,
  keyboardMovementHandler
} from './eventHandlers/keyboardMovement';
import { playerAttackHandler } from './eventHandlers/playerAttack';
import { playerInteractHandler } from './eventHandlers/playerInteract';
import { DebugFlags, DebugRenderer } from '@/systems/DebugRenderer';
import { playerDamagedHandler } from './eventHandlers/playerDamagedHandler';

export type GameLoop = { cleanup: () => void };

// @TODO maybe we should externalize all the queue related code to its own file...we might end up with a lot of different events
export const EventNames = {
  KEYBOARD_MOVEMENT: 'KEYBOARD_MOVEMENT',
  PLAYER_ATTACK: 'PLAYER_ATTACK',
  PLAYER_INTERACT: 'PLAYER_INTERACT',
  PLAYER_DAMAGED: 'PLAYER_DAMAGED',
  TOGGLE_DEBUG_OVERLAY: 'TOGGLE_DEBUG_OVERLAY'
} as const;
export type EventNames = Values<typeof EventNames>;

type KeyboardMovementEvent = {
  type: typeof EventNames.KEYBOARD_MOVEMENT;
  payload: Directions;
};

type PlayerAttackEvent = {
  type: typeof EventNames.PLAYER_ATTACK;
  payload: Point;
};

type PlayerInteractEvent = {
  type: typeof EventNames.PLAYER_INTERACT;
  payload: any;
};

type PlayerDamagedEvent = {
  type: typeof EventNames.PLAYER_DAMAGED;
  payload: number;
};

type ToggleDebugOverlayEvent = {
  type: typeof EventNames.TOGGLE_DEBUG_OVERLAY;
  payload: any;
};

type QueueEvent =
  | KeyboardMovementEvent
  | PlayerAttackEvent
  | PlayerInteractEvent
  | PlayerDamagedEvent
  | ToggleDebugOverlayEvent;

export type GameLoopQueue = EventQueue<QueueEvent>;

const eventQueueReducer =
  (world: ECSWorld, navigateTo: (path: string) => void) =>
  ({ type, payload }: QueueEvent) => {
    switch (type) {
      case EventNames.KEYBOARD_MOVEMENT:
        return keyboardMovementHandler(payload, world);

      case EventNames.PLAYER_ATTACK:
        return playerAttackHandler(payload, world);

      case EventNames.PLAYER_INTERACT:
        return playerInteractHandler(payload, world);

      case EventNames.PLAYER_DAMAGED:
        return playerDamagedHandler(payload, world, resolveSprite, navigateTo);

      case EventNames.TOGGLE_DEBUG_OVERLAY:
        return debugOverlayHandler(world);

      default:
        isNever(type);
    }
  };

export async function createGameLoop(
  app: Application,
  navigateTo: (path: string) => void
) {
  const world = createWorld();
  const queue = createEventQueue<QueueEvent>(
    eventQueueReducer(world, navigateTo)
  );
  app.stage.on('pointerdown', e => {
    queue.dispatch({ type: EventNames.PLAYER_ATTACK, payload: e.global });
  });
  const controls = createControls(queue);

  world.set('map', {
    level: 0
  } as TMap);

  world.set(DebugFlags.map, false);

  await createPlayer(world, { spriteName: 'wizard' });
  await loadMap(0, true, app, world);

  world.addSystem('movement', MovementSystem());
  world.addSystem('render', RenderSystem(resolveSprite, app));
  world.addSystem('debug_renderer', DebugRenderer(app));
  world.addSystem('camera', CameraSystem(resolveSprite, app));
  world.addSystem('interactions', InteractionSystem(resolveSprite, app));

  function tick(delta: number) {
    queue.process();
    world.runSystems({ delta });
  }

  app.ticker.add(tick);

  return {
    cleanup() {
      controls.cleanup();
    }
  };
}
