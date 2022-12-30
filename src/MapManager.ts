import * as PIXI from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import tilesheetImage from './assets/tilesheet.png';

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

const tileIdMap = new Map([
  [0, null],
  [1, 'floor'],
  [2, 'wall_bottom'],
  [3, 'wall_top'],
  [4, 'wall_side'],
  [5, 'stairs']
]);

export async function loadMap(app: PIXI.Application) {
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
      const tile = new Sprite(sheet.textures[textureName]);
      tile.position.set(j * TILE_SIZE, i * TILE_SIZE);
      mapGroup.addChild(tile);
    }
  }
  app.stage.addChild(mapGroup);

  return mapGroup;
}
