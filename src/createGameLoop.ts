import type { Application } from 'pixi.js';
import { createWorld, type ECSWorld } from '@/ecs/ECSWorld';
import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { CameraSystem } from './systems/CameraSystem';
import { resolveSprite } from './sprite/Sprite';
import {
  createEventQueue,
  type EventQueue,
  type EventQueueEvent
} from './createEventQueue';
import { VelocitySystem } from './systems/VelocitySystem';
import { createPlayer } from './createPlayer';
import { createControls } from './createControls';
import { keyboardMovementHandler } from './eventHandlers/keyboardMovement';

export type GameLoop = ReturnType<typeof createGameLoop>;

export const QUEUE_EVENTS = {
  KEYBOARD_MOVEMENT: 'keyboard movement'
} as const;

type Events = {
  [QUEUE_EVENTS.KEYBOARD_MOVEMENT]: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
};

export type EventQueueHandler = (e: any, world: ECSWorld) => void;
export type GameLoopQueue = EventQueue<Events>;

const queueHandlerLookup = {
  [QUEUE_EVENTS.KEYBOARD_MOVEMENT]: keyboardMovementHandler
};

export function createGameLoop(app: Application) {
  const world = createWorld();
  const queue = createEventQueue<Events>(({ type, payload }) => {
    queueHandlerLookup[type]({ type, payload }, world);
  });
  const controls = createControls(queue);

  world.addSystem('velocity', VelocitySystem);
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
