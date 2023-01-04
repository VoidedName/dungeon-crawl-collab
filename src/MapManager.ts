import { Application, Container, Sprite } from 'pixi.js';
import tilesheetImage from './assets/tilesets/base.png';
import type { ECSWorld } from './ecs/ECSWorld';
import { withInteractable } from './entity/components/Interactable';
import { hasPosition, type Position } from './entity/components/Position';
import { Text } from 'pixi.js';
import { registerRenderable } from './renderer/renderableManager';
import { positionComponent } from '@/entity/components/Position';
import type { Player } from './entity/components/Player';
import { withMapObject } from './entity/components/MapObject';
import type { MapObject } from './entity/components/MapObject';
import { withCollidable } from './entity/components/Collidable';
import { createTileset } from './renderer/createTileset';
import { renderableComponent } from './entity/components/Renderable';
import { createTrap } from './createTrap';
import type { ECSEntity } from './ecs/ECSEntity';

export type TMap = {
  level: number;
};

const enemies = ['trap'] as const;
type Enemies = typeof enemies[number];

const enemiesOnLevel: Record<Enemies, number>[] = [{ trap: 1 }, { trap: 2 }];

const spawners: Record<Enemies, (world: ECSWorld) => ECSEntity> = {
  trap: (world: ECSWorld) => createTrap(world)
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

export async function loadMap(
  level: number,
  spawnAtStairsUp: boolean,
  app: Application,
  world: ECSWorld
) {
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
    });
  }
  mapGroup = new Container();

  let spawnLocation;

  if (!maps[level]) {
    throw new Error(`no map of level ${level} found`);
  }

  const map = maps[level]!;

  const enemySpawnLocations = [];

  for (let i = 0; i < map.length; i++) {
    const row = map[i]!;
    for (let j = 0; j < row.length; j++) {
      const tileId = row[j]!;
      const textureName = `${TILESET_ID}-${tileId}`;
      const tileContainer = new Container();
      const tile = new Sprite(sheet.textures[textureName]);
      tileContainer.addChild(tile);
      tileContainer.position.set(j * TILE_SIZE, i * TILE_SIZE);

      if (tileId === STAIRS_DOWN_ID) {
        const text = new Text('Descend', {
          fontFamily: 'Arial',
          fontSize: 36,
          fill: 0xff0000,
          align: 'center'
        });

        text.scale.set(0.5, 0.5); // @FIXME scale the app stage X2, how to find a generic way to render crisp text ?
        text.position.set(0, -30);
        text.visible = false;

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
              x: globalPos.x + HALF_TILE,
              y: globalPos.y + HALF_TILE
            })
          )
          .with(renderableComponent)
          .build();

        registerRenderable(entity.entity_id, text);
      } else if (tileId === STAIRS_UP_ID) {
        const text = new Text('Ascend', {
          fontFamily: 'Arial',
          fontSize: 36,
          fill: 0x00ffff,
          align: 'center'
        });

        text.visible = false;
        text.scale.set(0.5, 0.5); // @FIXME scale the app stage X2, how to find a generic way to render crisp text ?
        text.position.set(0, -30);

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
              level > 0,
              STAIRS_INTERACT_RADIUS
            )
          )
          .with(withMapObject())
          .with(
            positionComponent({
              x: globalPos.x + HALF_TILE,
              y: globalPos.y + HALF_TILE
            })
          )
          .with(renderableComponent)
          .build();
        registerRenderable(entity.entity_id, text);
      } else if (collidableTypes.includes(tileId)) {
        const globalPos = tileContainer.toGlobal({ x: 0, y: 0 });

        world
          .createEntity()
          .with(withMapObject())
          .with(
            withCollidable({
              x: globalPos.x,
              y: globalPos.y,
              w: TILE_SIZE,
              h: TILE_SIZE
            })
          )
          .build();
      } else if (floorTiles.includes(tileId)) {
        enemySpawnLocations.push({
          x: j * TILE_SIZE + HALF_TILE,
          y: i * TILE_SIZE + HALF_TILE
        });
      }
      mapGroup.addChild(tileContainer);
    }
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

  const enemiesToSpawn = enemiesOnLevel[level]!;

  for (const enemyKey of enemies) {
    const amount = enemiesToSpawn[enemyKey];
    for (let i = 0; i < amount; i++) {
      const randomIndex = Math.floor(
        Math.random() * enemySpawnLocations.length
      );
      const location = enemySpawnLocations[randomIndex]!;
      enemySpawnLocations.splice(randomIndex, 1);
      const enemy = spawners[enemyKey](world);
      if (hasPosition(enemy)) {
        enemy.position.x = location.x;
        enemy.position.y = location.y;
      }
    }
  }

  return mapGroup;
}
