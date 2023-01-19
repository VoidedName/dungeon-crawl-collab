import type { Application } from 'pixi.js';
import { createWorld, type ECSWorld } from '@/ecs/ECSWorld';
import { loadMap } from './MapManager';
import { resolveRenderable } from './renderer/renderableManager';
import { createPlayer } from './entity/factories/createPlayer';
import { createControls } from './createControls';
import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { CameraSystem } from './systems/CameraSystem';
import { InteractionSystem } from './systems/InteractionSystem';
import { DeleteSystem } from './systems/DeleteSystem';
import { DebugFlags, DebugRenderer } from '@/systems/DebugRenderer';
import type { GameRenderer } from './renderer/createGameRenderer';
import { createCamera } from './createCamera';
import { createAudioManager } from './createAudioManager';
import { createEffectManager } from './createEffectManager';
import { PoisonSystem } from './systems/PoisonSystem';
import { loadSpriteTextures } from './renderer/createAnimatedSprite';
import { EnemySystem } from './systems/EnemySystem';
import { simpleMapGen } from '@/map/Map';
import { lehmerRandom } from '@/utils/rand/random';
import { createInventoryManager } from './createInventoryManager';
import { ProjectileSystem } from './systems/ProjectileSystem';
import { codex } from './assets/codex';
import { EntityLocationIndexSystem } from '@/systems/EntityLocationIndexSystem';
import { DynamicHitBoxSystem } from '@/systems/DynamicHitBoxSystem';
import {
  createExternalQueue,
  type ECSEvent,
  type ECSListener
} from './events/createExternalQueue';
import { createEventQueueReducer } from './events/createQueueReducer';
import {
  type GameLoopQueue,
  createEventQueue
} from './events/createEventQueue';

export type ECSApi = {
  cleanup: () => void;
  getEntities: ECSWorld['entitiesByComponent'];
  getGlobal: ECSWorld['get'];
  emit: (event: ECSEvent) => void;
  dispatch: GameLoopQueue['dispatch'];
  on: (cb: ECSListener) => void;
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
  world.set('highlightInteractables', false);
  world.set(DebugFlags.map, false);
  world.set(DebugFlags.hitboxes, false);
  world.set('inventory', createInventoryManager(world, queue));
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

export function createGameLoop(
  renderer: GameRenderer,
  navigateTo: (path: string) => void
): ECSApi {
  let state: GameState = { type: 'SETUP' };

  const world = createWorld();
  const externalQueue = createExternalQueue();
  const queue = createEventQueue(
    createEventQueueReducer(world, navigateTo, externalQueue.emit, renderer.app)
  );
  const controls = createControls(renderer.app, queue, world);

  world.addSystem('dynamic_hitboxes', DynamicHitBoxSystem);
  world.addSystem('entity_location', EntityLocationIndexSystem);
  world.addSystem('projectile', ProjectileSystem(queue));
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
          externalQueue.emit('ready');
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
    emit: externalQueue.emit,
    getEntities: world.entitiesByComponent,
    getGlobal: world.get,
    dispatch: queue.dispatch,
    on: externalQueue.on
  };
}
