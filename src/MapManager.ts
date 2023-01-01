import * as PIXI from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import tilesheetImage from './assets/tilesheet.png';
import type { ECSWorld } from './ecs/ECSWorld';
import { withInteractable } from './entity/components/Interactable';
import { Text } from 'pixi.js';
import { withRenderable } from './entity/components/Renderable';
import { register } from './renderer/renderableCache';
import { positionComponent } from '@/entity/components/Position';

const map = [
  [4, 3, 3, 3, 4, 0, 0, 0],
  [4, 1, 1, 1, 3, 3, 3, 3],
  [4, 1, 5, 1, 1, 1, 1, 1],
  [4, 1, 1, 1, 1, 1, 1, 1],
  [4, 1, 1, 1, 1, 1, 1, 1],
  [4, 1, 1, 1, 2, 2, 2, 2],
  [4, 1, 1, 1, 4, 0, 0, 0],
  [4, 1, 1, 1, 4, 0, 0, 0],
  [4, 2, 2, 2, 4, 0, 0, 0]
];

const TILE_SIZE = 64;
const HALF_TILE = TILE_SIZE / 2;

const STAIRS_ID = 5;
const STAIRS_RENDERABLE_ID = 'Stairs';
const STAIRS_PICKUP_RADIUS = TILE_SIZE * 1.25;
const tileIdMap = new Map([
  [0, null],
  [1, 'floor'],
  [2, 'wall_bottom'],
  [3, 'wall_top'],
  [4, 'wall_side'],
  [STAIRS_ID, 'stairs']
]);

export async function loadMap(app: PIXI.Application, world: ECSWorld) {
  const mapTileSheetTexture = await PIXI.Assets.load(tilesheetImage);

  function getFrameDetail(index = 0) {
    return {
      frame: { x: TILE_SIZE * index, y: 0, w: TILE_SIZE, h: TILE_SIZE },
      sourceSize: { w: TILE_SIZE, h: TILE_SIZE },
      spriteSourceSize: { x: 0, y: 0 }
    };
  }

  const data: PIXI.ISpritesheetData = {
    frames: {
      floor: getFrameDetail(0),
      wall_bottom: getFrameDetail(1),
      wall_top: getFrameDetail(2),
      wall_side: getFrameDetail(3),
      stairs: getFrameDetail(4)
    },
    meta: {
      scale: '1'
    }
  };

  const sheet = new PIXI.Spritesheet(await mapTileSheetTexture, data);
  await sheet.parse();

  const mapGroup = new Container();

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

      if (tileId === STAIRS_ID) {
        const text = new Text('descend', {
          fontFamily: 'Arial',
          fontSize: 36,
          fill: 0xffffff,
          align: 'center'
        });

        text.scale.set(0.5, 0.5); // @FIXME scale the app stage X2, how to find a generic way to render crisp text ?
        text.position.set(0, -30);
        register(STAIRS_RENDERABLE_ID, text);

        tileContainer.addChild(text);

        const globalPos = tileContainer.toGlobal({ x: 0, y: 0 });
        world
          .createEntity()
          .with(withInteractable('descend', STAIRS_PICKUP_RADIUS))
          .with(
            positionComponent({
              x: globalPos.x + HALF_TILE,
              y: globalPos.y + HALF_TILE
            })
          )
          .with(withRenderable(STAIRS_RENDERABLE_ID))
          .build();
      }

      mapGroup.addChild(tileContainer);
    }
  }
  app.stage.addChild(mapGroup);

  return mapGroup;
}
