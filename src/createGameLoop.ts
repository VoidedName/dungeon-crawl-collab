import type { Application } from 'pixi.js';
import { createWorld } from '@/ecs/ECSWorld';
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

export type GameLoop = ReturnType<typeof createGameLoop>;

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

export function createGameLoop(app: Application) {
  const world = createWorld();
  const queue = createEventQueue<QueueEvent>(event => {
    switch (event.type) {
      case EventNames.KEYBOARD_MOVEMENT:
        return keyboardMovementHandler(event.payload, world);

      default:
        isNever(event.type);
    }
  });
  const controls = createControls(queue);

  world.addSystem('movement', MovementSystem);
  world.addSystem('render', RenderSystem(resolveSprite));
  world.addSystem('camera', CameraSystem(resolveSprite, app));

  createPlayer(world);

  let rafId: number;

  async function tick() {
    await queue.process();
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
