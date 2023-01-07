import type { Application } from 'pixi.js';
import { createWorld, type ECSWorld } from '@/ecs/ECSWorld';
import { isNever } from './utils/assertions';
import type { Point, Values } from './utils/types';

import { loadMap } from './MapManager';
import { resolveRenderable } from './renderer/renderableManager';
import { createEventQueue, type EventQueue } from './createEventQueue';
import { createPlayer } from './entity/factories/createPlayer';
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
import { createCamera } from './createCamera';
import { setCameraOffsetHandler } from './eventHandlers/setCameraOffset';
import { createAudioManager } from './createAudioManager';
import { createEffectManager } from './createEffectManager';
import { PoisonSystem } from './systems/PoisonSystem';
import { loadSpriteTextures } from './renderer/createAnimatedSprite';
import { EnemySystem } from './systems/EnemySystem';
import type { TItem } from './createInventoryManager';
import type { ECSEntityId } from './ecs/ECSEntity';
import { damageHandler } from './eventHandlers/damageHandler';
import { simpleMapGen } from '@/map/Map';
import { lehmerRandom } from '@/utils/rand/random';
import { createInventoryManager } from './createInventoryManager';
import { itemHandler } from './eventHandlers/itemHandler';
import { ProjectileSystem } from './systems/ProjectileSystem';
import { codex } from './assets/codex';
import { EntityLocationIndexSystem } from '@/systems/EntityLocationIndexSystem';

// @TODO maybe we should externalize all the queue related code to its own file...we might end up with a lot of different events
export const EventNames = {
  KEYBOARD_MOVEMENT: 'KEYBOARD_MOVEMENT',
  PLAYER_ATTACK: 'PLAYER_ATTACK',
  PLAYER_INTERACT: 'PLAYER_INTERACT',
  TOGGLE_DEBUG_OVERLAY: 'TOGGLE_DEBUG_OVERLAY',
  SET_CAMERA_OFFSET: 'SET_CAMERA_OFFSET',
  DAMAGE: 'DAMAGE',
  USE_ITEM: 'USE_ITEM'
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

type ToggleDebugOverlayEvent = {
  type: typeof EventNames.TOGGLE_DEBUG_OVERLAY;
  payload: any;
};

type SetCameraOffsetEvent = {
  type: typeof EventNames.SET_CAMERA_OFFSET;
  payload: Point;
};

type DamageEvent = {
  type: typeof EventNames.DAMAGE;
  payload: {
    damage: number;
    entityId: ECSEntityId;
  };
};

type UseItemEvent = {
  type: typeof EventNames.USE_ITEM;
  payload: TItem;
};

type QueueEvent =
  | KeyboardMovementEvent
  | PlayerAttackEvent
  | PlayerInteractEvent
  | ToggleDebugOverlayEvent
  | SetCameraOffsetEvent
  | DamageEvent
  | UseItemEvent;

export type GameLoopQueue = EventQueue<QueueEvent>;

export type ECSEvent = 'ready' | 'playerHealthChanged';

export type ECSApi = {
  cleanup: () => void;
  getEntities: ECSWorld['entitiesByComponent'];
  getGlobal: ECSWorld['get'];
  emit: (event: ECSEvent) => void;
  dispatch: GameLoopQueue['dispatch'];
  on: (cb: (event: ECSEvent) => void) => void;
};

const eventQueueReducer =
  (world: ECSWorld, navigateTo: (path: string) => void, emit: ECSEmitter) =>
  ({ type, payload }: QueueEvent) => {
    switch (type) {
      case EventNames.KEYBOARD_MOVEMENT:
        return keyboardMovementHandler(payload, world);

      case EventNames.PLAYER_ATTACK:
        return playerAttackHandler(payload, world);

      case EventNames.PLAYER_INTERACT:
        return playerInteractHandler(payload, world);

      case EventNames.TOGGLE_DEBUG_OVERLAY:
        return debugOverlayHandler(world);

      case EventNames.SET_CAMERA_OFFSET:
        return setCameraOffsetHandler(payload, world);

      case EventNames.DAMAGE:
        return damageHandler(payload, world, navigateTo, emit);

      case EventNames.USE_ITEM:
        return itemHandler(payload, world, emit);

      default:
        isNever(type);
    }
  };

const setup = async (
  app: Application,
  world: ECSWorld,
  queue: GameLoopQueue
) => {
  const rng = lehmerRandom(2023);
  const map = simpleMapGen(20, 20, 0, 3, rng);

  world.set('map', map);
  world.set('rng', rng);
  world.set('world map', [map]);
  world.set(DebugFlags.map, false);
  world.set('inventory', createInventoryManager(queue));
  world.set('audio', createAudioManager());
  world.set('effects', createEffectManager(app));

  // @FIXME at the moment we cannot load the texture and the map in parallel
  // because the map needs a player, and the player needs its textures to create the sprite
  // the fix would be to rip out the async part of loadMap, which is just creating the tileSet
  // another possible fix would be to place the player on the map spawn point somewhere else, removing the dependency to the player
  // The whole map loading process will probably be completely revamped fairly soon, so no need to overthink it for now, just to parallel load some things
  await loadSpriteTextures();
  const player = createPlayer(world, {
    playerClass: codex.playerClasses.wizard()
  });
  await loadMap(map, true, app, world);

  const camera = createCamera(world, player.entity_id);
  camera.camera.following = player.entity_id;
};

type GameState = { type: 'RUNNING' } | { type: 'SETUP' } | { type: 'LOADING' };

export type ECSEmitter = typeof emit;

const listeners: any[] = [];
function emit(event: ECSEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function createGameLoop(
  renderer: GameRenderer,
  navigateTo: (path: string) => void
): ECSApi {
  let state: GameState = { type: 'SETUP' };

  const world = createWorld();
  const queue = createEventQueue<QueueEvent>(
    eventQueueReducer(world, navigateTo, emit)
  );
  const controls = createControls(renderer.app, queue, world);

  world.addSystem('entity_location', EntityLocationIndexSystem);
  world.addSystem('projectile', ProjectileSystem());
  world.addSystem('movement', MovementSystem());
  world.addSystem('render', RenderSystem(resolveRenderable, renderer.app));
  world.addSystem('debug_renderer', DebugRenderer(renderer.app));
  world.addSystem('camera', CameraSystem(renderer.app));
  world.addSystem(
    'interactions',
    InteractionSystem(resolveRenderable, renderer.app)
  );
  world.addSystem('poison', PoisonSystem(queue));
  world.addSystem('enemies', EnemySystem(resolveRenderable, queue));
  world.addSystem('destroy', DeleteSystem());

  function tick(delta: number) {
    switch (state.type) {
      case 'SETUP':
        setup(renderer.app, world, queue).then(() => {
          state = { type: 'RUNNING' };
          emit('ready');
        });
        state = { type: 'LOADING' };
        break;
      case 'RUNNING':
        queue.process();
        world.runSystems({ delta });
        break;
      case 'LOADING':
        // update loading ui
        break;
      default:
      // should never happen, maybe panic here
    }
  }

  renderer.app.ticker.add(tick);

  return {
    cleanup() {
      renderer.cleanup();
      controls.cleanup();
    },
    emit,
    getEntities: world.entitiesByComponent,
    getGlobal: world.get,
    dispatch: queue.dispatch,
    on: (cb: (event: ECSEvent) => void) => {
      listeners.push(cb);
    }
  };
}
