import type { Application } from 'pixi.js';
import { createWorld, type ECSWorld } from '@/ecs/ECSWorld';
import { isNever } from './utils/assertions';
import type { Point, Values } from './utils/types';

import { loadMap } from './MapManager';
import { resolveRenderable } from './renderer/renderableManager';
import { createEventQueue, type EventQueue } from './createEventQueue';
import { createPlayer } from './createPlayer';
import { createTrap } from './createTrap';
import { createControls } from './createControls';

import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { CameraSystem } from './systems/CameraSystem';
import { InteractionSystem } from './systems/InteractionSystem';
import { DeleteSystem } from './systems/DeleteSystem';
import { debugOverlayHandler } from '@/eventHandlers/debugOverlayHandler';

import {
  type Directions,
  keyboardMovementHandler
} from './eventHandlers/keyboardMovement';
import { playerAttackHandler } from './eventHandlers/playerAttack';
import { playerInteractHandler } from './eventHandlers/playerInteract';
import { DebugFlags, DebugRenderer } from '@/systems/DebugRenderer';
import type { GameRenderer } from './renderer/createGameRenderer';
import { playerDamagedHandler } from './eventHandlers/playerDamagedHandler';
import { createCamera } from './createCamera';
import { setCameraOffsetHandler } from './eventHandlers/setCameraOffset';
import { createAudioManager } from './createAudioManager';
import { createEffectManager } from './createEffectManager';
import { PoisonSystem } from './systems/PoisonSystem';
import { loadSpriteTextures } from './renderer/createAnimatedSprite';

// @TODO maybe we should externalize all the queue related code to its own file...we might end up with a lot of different events
export const EventNames = {
  KEYBOARD_MOVEMENT: 'KEYBOARD_MOVEMENT',
  PLAYER_ATTACK: 'PLAYER_ATTACK',
  PLAYER_INTERACT: 'PLAYER_INTERACT',
  PLAYER_DAMAGED: 'PLAYER_DAMAGED',
  TOGGLE_DEBUG_OVERLAY: 'TOGGLE_DEBUG_OVERLAY',
  SET_CAMERA_OFFSET: 'SET_CAMERA_OFFSET'
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

type SetCameraOffsetEvent = {
  type: typeof EventNames.SET_CAMERA_OFFSET;
  payload: Point;
};

type QueueEvent =
  | KeyboardMovementEvent
  | PlayerAttackEvent
  | PlayerInteractEvent
  | PlayerDamagedEvent
  | ToggleDebugOverlayEvent
  | SetCameraOffsetEvent;

export type GameLoopQueue = EventQueue<QueueEvent>;

export type ECSApi = {
  cleanup: () => void;
  getEntities: ECSWorld['entitiesByComponent'];
  getGlobal: ECSWorld['get'];
  dispatch: GameLoopQueue['dispatch'];
  on: () => void; // to be defined
};

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
        return playerDamagedHandler(payload, world, navigateTo);

      case EventNames.TOGGLE_DEBUG_OVERLAY:
        return debugOverlayHandler(world);

      case EventNames.SET_CAMERA_OFFSET:
        return setCameraOffsetHandler(payload, world);

      default:
        isNever(type);
    }
  };

const setup = async (app: Application, world: ECSWorld) => {
  world.set('map', { level: 0 });
  world.set(DebugFlags.map, false);
  world.set('audio', createAudioManager());
  world.set('effects', createEffectManager(app));

  // @FIXME at the moment we cannot load the texture and the map in parallel
  // because the map needs a player, and the player needs its textures to create the sprite
  // the fix would be to rip out the async part of loadMap, which is just creating the tileSet
  // another possible fix would be to place the player on the map spawn point somewhere else, removing the dependency to the player
  // The whole map loading process will probably be completely revamped fairly soon, so no need to overthink it for now, just to parallel load some things
  await loadSpriteTextures();
  const player = createPlayer(world, { spriteName: 'wizard' });
  await loadMap(0, true, app, world);

  const camera = createCamera(world, player.entity_id);
  camera.camera.following = player.entity_id;
  createTrap(world, { spriteName: 'trap' });
};

export function createGameLoop(
  renderer: GameRenderer,
  navigateTo: (path: string) => void
): ECSApi {
  const world = createWorld();
  const queue = createEventQueue<QueueEvent>(
    eventQueueReducer(world, navigateTo)
  );
  const controls = createControls(renderer.app, queue);

  world.addSystem('movement', MovementSystem());
  world.addSystem('render', RenderSystem(resolveRenderable, renderer.app));
  world.addSystem('debug_renderer', DebugRenderer(renderer.app));
  world.addSystem('camera', CameraSystem(renderer.app));
  world.addSystem(
    'interactions',
    InteractionSystem(resolveRenderable, renderer.app)
  );
  world.addSystem('poison', PoisonSystem(resolveRenderable));
  world.addSystem('destroy', DeleteSystem(resolveRenderable));

  function tick(delta: number) {
    queue.process();
    world.runSystems({ delta });
  }

  setup(renderer.app, world).then(() => {
    renderer.app.ticker.add(tick);
  });

  return {
    cleanup() {
      renderer.cleanup();
      controls.cleanup();
    },
    getEntities: world.entitiesByComponent,
    getGlobal: world.get,
    dispatch: queue.dispatch,
    on: () => {
      console.log('ecsApi.on not implemented yet');
    }
  };
}
