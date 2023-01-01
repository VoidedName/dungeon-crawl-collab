import * as PIXI from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import tilesheetImage from './assets/tilesheet.png';
import type { ECSWorld } from './ecs/ECSWorld';
import { withInteractable } from './entity/components/Interactable';
import { withPosition, type Position } from './entity/components/Position';
import { Text } from 'pixi.js';
import { withRenderable } from './entity/components/Renderable';
import { register } from './renderer/renderableCache';
import { positionComponent } from '@/entity/components/Position';
import type { Player } from './entity/components/Player';
import { withMapObject } from './entity/components/MapObject';
import type { MapObject } from './entity/components/MapObject';
import { withCollidable } from './entity/components/Collidable';

const maps = [
  [
    [4, 3, 3, 3, 4, 0, 0, 0, 0],
    [4, 1, 1, 1, 3, 3, 3, 3, 4],
    [4, 1, 5, 1, 1, 1, 1, 1, 4],
    [4, 1, 1, 1, 1, 1, 6, 1, 4],
    [4, 1, 1, 1, 1, 1, 1, 1, 4],
    [4, 1, 1, 1, 2, 2, 2, 2, 4],
    [4, 1, 1, 1, 4, 0, 0, 0, 0],
    [4, 1, 1, 1, 4, 0, 0, 0, 0],
    [4, 2, 2, 2, 4, 0, 0, 0, 0]
  ],
  [
    [4, 3, 3, 3, 3, 3, 3, 3, 4],
    [4, 1, 1, 1, 1, 1, 1, 1, 4],
    [4, 1, 6, 1, 1, 1, 1, 1, 4],
    [4, 1, 1, 1, 1, 1, 1, 1, 4],
    [4, 2, 2, 2, 2, 2, 2, 2, 4]
  ]
];

const TILE_SIZE = 64;
const HALF_TILE = TILE_SIZE / 2;

const STAIRS_DOWN_ID = 5;
const STAIRS_UP_ID = 6;
const STAIRS_DOWN_RENDERABLE_ID = 'StairsDown';
const STAIRS_UP_RENDERABLE_ID = 'StairsUp';
const STAIRS_INTERACT_RADIUS = TILE_SIZE * 1.25;
const tileIdMap = new Map([
  [0, null],
  [1, 'floor'],
  [2, 'wall_bottom'],
  [3, 'wall_top'],
  [4, 'wall_side'],
  [STAIRS_DOWN_ID, 'stairs_down'],
  [STAIRS_UP_ID, 'stairs_up']
]);

const collidableTypes = [2, 3, 4];

function getFrameDetail(index = 0) {
  return {
    frame: { x: TILE_SIZE * index, y: 0, w: TILE_SIZE, h: TILE_SIZE },
    sourceSize: { w: TILE_SIZE, h: TILE_SIZE },
    spriteSourceSize: { x: 0, y: 0 }
  };
}

let mapGroup: Container;
let sheet: any;

async function loadMapSpriteSheet() {
  if (!sheet) {
    const mapTileSheetTexture = await PIXI.Assets.load(tilesheetImage);

    const data: PIXI.ISpritesheetData = {
      frames: {
        floor: getFrameDetail(0),
        wall_bottom: getFrameDetail(1),
        wall_top: getFrameDetail(2),
        wall_side: getFrameDetail(3),
        stairs_down: getFrameDetail(4),
        stairs_up: getFrameDetail(5)
      },
      meta: {
        scale: '1'
      }
    };

    sheet = new PIXI.Spritesheet(await mapTileSheetTexture, data);
    await sheet.parse();
  }
  return sheet;
}

export async function loadMap(
  level: number,
  spawnAtStairsUp: boolean,
  app: PIXI.Application,
  world: ECSWorld
) {
  await loadMapSpriteSheet();

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

  for (let i = 0; i < map.length; i++) {
    const row = map[i]!;
    for (let j = 0; j < row.length; j++) {
      const tileId = row[j]!;
      if (!tileIdMap.has(tileId)) continue;
      const textureName = tileIdMap.get(tileId)!;
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
        register(STAIRS_DOWN_RENDERABLE_ID, text);

        tileContainer.addChild(text);

        const globalPos = tileContainer.toGlobal({ x: 0, y: 0 });

        if (!spawnAtStairsUp) {
          spawnLocation = tileContainer.toGlobal({
            x: HALF_TILE,
            y: HALF_TILE
          });
        }

        world
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
          .with(withRenderable(STAIRS_DOWN_RENDERABLE_ID))
          .build();
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
        register(STAIRS_UP_RENDERABLE_ID, text);

        tileContainer.addChild(text);

        const globalPos = tileContainer.toGlobal({ x: 0, y: 0 });

        if (spawnAtStairsUp) {
          spawnLocation = tileContainer.toGlobal({
            x: HALF_TILE,
            y: HALF_TILE
          });
        }

        world
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
          .with(withPosition(globalPos.x + HALF_TILE, globalPos.y + HALF_TILE))
          .with(withRenderable(STAIRS_UP_RENDERABLE_ID))
          .build();
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

  return mapGroup;
}
