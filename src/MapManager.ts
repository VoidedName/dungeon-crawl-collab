import { Application, Container, Sprite } from 'pixi.js';
import tilesheetImage from '@/assets/tilesets/base.png';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { withInteractable } from '@/entity/components/Interactable';
import { hasPosition, type Position } from '@/entity/components/Position';
import { Text } from 'pixi.js';
import {
  registerRenderable,
  resolveRenderable
} from './renderer/renderableManager';
import { positionComponent } from '@/entity/components/Position';
import type { Player } from './entity/components/Player';
import { withMapObject } from './entity/components/MapObject';
import type { MapObject } from './entity/components/MapObject';
import { collidableComponent } from './entity/components/Collidable';
import { createTileset } from './renderer/createTileset';
import { renderableComponent } from './entity/components/Renderable';
import { sizeComponent } from './entity/components/Size';
import { EnemyType } from './entity/components/Enemy';
import { createTrap } from './entity/factories/createTrap';
import type { ECSEntity } from './ecs/ECSEntity';
import { hasAnimatable } from './entity/components/Animatable';
import { codex } from './assets/codex';
import type { GameMap } from '@/map/Map';
import { lehmerRandom } from '@/utils/rand/random';
import { hitboxes } from '@/entity/components/HitBoxes';
import { none, some } from '@/utils/Maybe';
import { mapLayer, overlayLayer } from './renderer/createGameRenderer';

export type TMap = {
  level: number;
};

const spawners: Record<
  EnemyType,
  (world: ECSWorld, app: Application) => ECSEntity
> = {
  trap: (world, app) => createTrap(world, app, { enemy: codex.enemies.trap() })
};

export const maps = [
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 2, 3, 2, 3, 2, 4, 0],
    [0, 1, 9, 10, 9, 9, 10, 4, 0],
    [0, 1, 9, 5, 10, 10, 6, 4, 0],
    [0, 1, 9, 9, 9, 9, 9, 4, 0],
    [0, 1, 9, 9, 9, 9, 9, 4, 0],
    [0, 1, 10, 9, 9, 9, 10, 4, 0],
    [0, 1, 9, 10, 10, 9, 9, 4, 0],
    [0, 15, 16, 16, 16, 16, 16, 18, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 2, 3, 2, 3, 2, 4, 0],
    [0, 1, 10, 10, 10, 9, 10, 4, 0],
    [0, 1, 9, 10, 6, 9, 9, 4, 0],
    [0, 1, 10, 9, 10, 9, 9, 4, 0],
    [0, 15, 16, 13, 9, 12, 16, 18, 0]
  ]
];

export const TILE_SIZE = 64;
export const HALF_TILE = TILE_SIZE / 2;

const STAIRS_DOWN_ID = 5;
const STAIRS_UP_ID = 6;
const STAIRS_INTERACT_RADIUS = TILE_SIZE * 1.25;
const TILESET_ID = 'base';
const TILESET_ROWS = 3;
const TILESET_COLUMNS = 7;

const collidableTypes = [1, 2, 3, 4, 8, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21];
const floorTiles = [9, 10];

let mapGroup: Container;
let sheet: any;

const WALL_LEFT = [1, 8];
const WALL_RIGHT = [4, 11];
const WALL_TOP = [2, 3];
const WALL_BOTTOM = [16];
const FLOOR = [9, 10];
// const WALL_CORNER_BOTTOM_RIGHT = [12];
const WALL_CORNER_BOTTOM_LEFT = [13];
const TILE_NA = [-1];

export async function loadMap(
  map: GameMap,
  spawnAtStairsUp: boolean,
  app: Application,
  world: ECSWorld
) {
  const rng = lehmerRandom(map.level + map.width + map.height);

  sheet = await createTileset({
    id: TILESET_ID,
    tileSize: TILE_SIZE,
    dimensions: { w: TILESET_COLUMNS * TILE_SIZE, h: TILESET_ROWS * TILE_SIZE },
    path: tilesheetImage
  });

  if (mapGroup) {
    mapGroup.destroy();
    world.entitiesByComponent<[MapObject]>(['mapObject']).forEach(mapObject => {
      world.deleteEntity(mapObject.entity_id);
      if (hasAnimatable(mapObject)) {
        resolveRenderable(mapObject.entity_id).destroy();
      }
    });
  }
  mapGroup = new Container();

  let spawnLocation;

  const enemySpawnLocations = [];

  const stairsUp = map.entry();
  const stairsDown = map.stairs();

  for (const [x, y] of map) {
    let tileOptions = map.isBlocked(x, y) ? TILE_NA : FLOOR;
    if (map.isBlocked(x, y)) {
      let neighborhood = +!map.isBlocked(x - 1, y);
      neighborhood += 2 * +!map.isBlocked(x + 1, y);
      neighborhood += 4 * +!map.isBlocked(x, y - 1);
      neighborhood += 8 * +!map.isBlocked(x, y + 1);
      // TODO: Tileset matching
      switch (neighborhood) {
        case 0: // surround by wall
          tileOptions = TILE_NA;
          break;
        case 1: // floor to the left
          tileOptions = WALL_RIGHT;
          break;
        case 2: // floor to the right
          tileOptions = WALL_LEFT;
          break;
        case 4: // bottom
          tileOptions = WALL_BOTTOM;
          break;
        case 8: // top
          tileOptions = WALL_TOP;
          break;
        case 6:
          tileOptions = WALL_CORNER_BOTTOM_LEFT;
          break;
        default:
          tileOptions = WALL_TOP;
      }
    }

    let tileId = tileOptions[rng.die(tileOptions.length) - 1]!;

    if (x === 0 || y === 0 || x === map.width - 1 || y === map.height - 1) {
      tileId = WALL_TOP[rng.die(WALL_TOP.length) - 1]!;
    }

    if (x === stairsUp[0] && y === stairsUp[1]) {
      tileId = STAIRS_UP_ID;
    }
    if (x === stairsDown[0] && y === stairsDown[1]) {
      tileId = STAIRS_DOWN_ID;
    }

    const textureName = `${TILESET_ID}-${tileId}`;
    const tileContainer = new Container();
    const tile = new Sprite(sheet.textures[textureName]);
    tileContainer.addChild(tile);
    tileContainer.position.set(x * TILE_SIZE, y * TILE_SIZE);

    if (tileId === STAIRS_DOWN_ID) {
      const text = new Text('Descend', {
        fontFamily: 'Inconsolata',
        fontSize: 28,
        fill: 0xff0000,
        align: 'center'
      });
      text.name = 'text';
      text.scale.set(0.5, 0.5); // @FIXME scale the app stage X2, how to find a generic way to render crisp text ?
      text.position.set(3, -30);
      text.visible = false;
      text.parentLayer = overlayLayer;
      tileContainer.addChild(text);

      const globalPos = tileContainer.toGlobal({ x: 0, y: 0 });

      if (!spawnAtStairsUp) {
        spawnLocation = tileContainer.toGlobal({
          x: HALF_TILE,
          y: HALF_TILE
        });
      }

      const entity = world
        .createEntity()
        .with(
          withInteractable(
            'Descend',
            'stairsDown',
            true,
            STAIRS_INTERACT_RADIUS
          )
        )
        .with(withMapObject())
        .with(
          positionComponent({
            x: globalPos.x,
            y: globalPos.y
          })
        )
        .with(renderableComponent)
        .build();

      registerRenderable(entity.entity_id, tileContainer);
    } else if (tileId === STAIRS_UP_ID) {
      const text = new Text('Ascend', {
        fontFamily: 'Inconsolata',
        fontSize: 28,
        fill: 0xff0000,
        align: 'center'
      });
      text.parentLayer = overlayLayer;
      text.name = 'text';
      text.scale.set(0.5, 0.5); // @FIXME scale the app stage X2, how to find a generic way to render crisp text ?
      text.position.set(3, -30);
      text.visible = false;
      tileContainer.addChild(text);

      const globalPos = tileContainer.toGlobal({ x: 0, y: 0 });

      if (spawnAtStairsUp) {
        spawnLocation = tileContainer.toGlobal({
          x: HALF_TILE,
          y: HALF_TILE
        });
      }

      const entity = world
        .createEntity()
        .with(
          withInteractable(
            'Ascend',
            'stairsUp',
            map.level > 0,
            STAIRS_INTERACT_RADIUS
          )
        )
        .with(withMapObject())
        .with(
          positionComponent({
            x: globalPos.x,
            y: globalPos.y
          })
        )
        .with(renderableComponent)
        .build();

      registerRenderable(entity.entity_id, tileContainer);
    } else if (collidableTypes.includes(tileId)) {
      const globalPos = tileContainer.toGlobal({ x: 0, y: 0 });

      world
        .createEntity()
        .with(withMapObject())
        .with(
          positionComponent({
            x: globalPos.x + TILE_SIZE / 2,
            y: globalPos.y + TILE_SIZE / 2
          })
        )
        .with(sizeComponent({ w: TILE_SIZE, h: TILE_SIZE }))
        .with(collidableComponent)
        .with(
          hitboxes({
            damage: none(),
            hurt: none(),
            movement: some({
              x: globalPos.x,
              y: globalPos.y,
              w: TILE_SIZE,
              h: TILE_SIZE
            })
          })
        )
        .build();
    } else if (floorTiles.includes(tileId)) {
      enemySpawnLocations.push({
        x: x * TILE_SIZE + HALF_TILE,
        y: y * TILE_SIZE + HALF_TILE
      });
    }
    mapGroup.parentLayer = mapLayer;
    mapGroup.addChild(tileContainer);
  }

  app.stage.addChild(mapGroup);

  const player = world.entitiesByComponent<[Player, Position]>([
    'player',
    'position'
  ])[0];

  if (!player) {
    throw new Error('no player found in world');
  }

  if (!spawnLocation) {
    throw new Error('no spawn location found in map');
  }

  player.position.x = spawnLocation?.x;
  player.position.y = spawnLocation?.y;

  for (const enemyKey of Object.values(EnemyType)) {
    const amount = rng.nextRange(3, 5) + map.level * 2;
    for (let i = 0; i < amount; i++) {
      const randomIndex = Math.floor(rng.nextF() * enemySpawnLocations.length);
      const location = enemySpawnLocations[randomIndex]!;
      enemySpawnLocations.splice(randomIndex, 1);
      const spawner = spawners[enemyKey]!;
      const enemy = spawner(world, app);
      if (hasPosition(enemy)) {
        enemy.position.x = location.x;
        enemy.position.y = location.y;
      }
    }
  }

  return mapGroup;
}
