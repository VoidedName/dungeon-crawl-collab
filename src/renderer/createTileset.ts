import type { Size } from '@/utils/types';
import * as PIXI from 'pixi.js';

const loadedTextures = new Map<string, Promise<PIXI.Texture>>();

export type CreateTileSetOptions = {
  id: string;
  path: string;
  dimensions: Size;
  tileSize: number;
};

export const createTileset = async ({
  path,
  dimensions,
  tileSize,
  id
}: CreateTileSetOptions) => {
  if (!loadedTextures.has(path)) {
    loadedTextures.set(path, PIXI.Assets.load(path) as Promise<PIXI.Texture>);
  }

  const texture = (await loadedTextures.get(path)) as PIXI.Texture;
  const tileCount = (dimensions.w / tileSize) * (dimensions.h / tileSize);

  const data = {
    frames: Object.fromEntries(
      Array.from({ length: tileCount }, (_, index) => {
        const textureId = `${id}-${index}`;

        // avoids console warnings with HMR
        if (import.meta.env.DEV) {
          PIXI.Texture.removeFromCache(textureId);
        }

        const columns = dimensions.w / tileSize;

        return [
          textureId,
          {
            frame: {
              x: (index % columns) * tileSize,
              y: Math.floor(index / columns) * tileSize,
              w: tileSize,
              h: tileSize
            },
            sourceSize: { w: tileSize, h: tileSize },
            spriteSourceSize: {
              x: 0,
              y: 0,
              w: tileSize,
              h: tileSize
            }
          }
        ];
      })
    ),
    meta: {
      image: path,
      size: dimensions,
      scale: '1'
    }
  };

  const spritesheet = new PIXI.Spritesheet(texture, data);
  await spritesheet.parse();

  return spritesheet;
};
