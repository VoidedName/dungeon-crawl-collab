import * as PIXI from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import tilesheetImage from './assets/tilesheet.png';
import type { ECSWorld } from './ecs/ECSWorld';
import { withInteractable } from './entity/components/Interactable';
import { withPosition } from './entity/components/Position';
import { Text } from 'pixi.js';
import { withRenderable } from './entity/components/Renderable';

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

const STAIRS_ID = 5;

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

  const defer = [];

  for (let i = 0; i < map.length; i++) {
    const row = map[i]!;
    for (let j = 0; j < row.length; j++) {
      const tileId = row[j]!;
      if (!tileIdMap.has(tileId)) continue;
      const textureName = tileIdMap.get(tileId)!;
      const tile = new Sprite(sheet.textures[textureName]);
      tile.position.set(j * TILE_SIZE, i * TILE_SIZE);
      mapGroup.addChild(tile);

      if (tileId === STAIRS_ID) {
        defer.push(() => {
          const text = new Text('descend', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center'
          });
          text.anchor.y = 2.5;
          text.anchor.x = 0.5;
          // addEntity({
          //   id: 250, // TODO: fix me, hacky
          //   sprite: text
          // });
          app.stage.addChild(text);

          world
            .createEntity()
            .with(withInteractable('descend'))
            .with(withPosition(tile.position.x + 32, tile.position.y + 32))
            .with(withRenderable(250))
            .build();
        });
      }
    }
  }
  app.stage.addChild(mapGroup);

  defer.forEach(cb => cb());

  return mapGroup;
}
