import type { Application } from 'pixi.js';
import { createWorld, type ECSWorld } from '@/ecs/ECSWorld';
import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { CameraSystem } from './systems/CameraSystem';
import { resolveSprite } from './sprite/Sprite';
import { createEventQueue, type EventQueue } from './createEventQueue';
import { createPlayer } from './createPlayer';
import { createControls } from './createControls';
import {
  type Directions,
  keyboardMovementHandler
} from './eventHandlers/keyboardMovement';
import type { Values } from './utils/types';
import { isNever } from './utils/assertions';
import { AnimationSystem } from './systems/AnimationSystem';

export type GameLoop = { cleanup: () => void };

// @TODO maybe we should externalize all the queue related code to its own file...we might end up with a lot of different events
export const EventNames = {
  KEYBOARD_MOVEMENT: 'KEYBOARD_MOVEMENT'
} as const;
export type EventNames = Values<typeof EventNames>;

type KeyboardActionEvent = {
  type: typeof EventNames.KEYBOARD_MOVEMENT;
  payload: Directions;
};

type QueueEvent = KeyboardActionEvent;

export type GameLoopQueue = EventQueue<QueueEvent>;

const eventQueueReducer = (world: ECSWorld) => (event: QueueEvent) => {
  switch (event.type) {
    case EventNames.KEYBOARD_MOVEMENT:
      return keyboardMovementHandler(event.payload, world);

    default:
      isNever(event.type);
  }
};

export function createGameLoop(app: Application) {
  const world = createWorld();
  const queue = createEventQueue<QueueEvent>(eventQueueReducer(world));
  const controls = createControls(queue);

  world.addSystem('movement', MovementSystem);
  world.addSystem('render', RenderSystem(resolveSprite, app));
  world.addSystem('camera', CameraSystem(resolveSprite, app));
  world.addSystem('animation', AnimationSystem(resolveSprite));

  createPlayer(world, { spriteName: 'wizard' });

  let rafId: number;

  function tick() {
    queue.process();
    world.runSystems();
    rafId = window.requestAnimationFrame(tick);
  }

  rafId = window.requestAnimationFrame(tick);

  return {
    cleanup() {
      window.cancelAnimationFrame(rafId);
      controls.cleanup();
    }
  };
}
