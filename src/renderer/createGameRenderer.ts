import * as PIXI from 'pixi.js';
import type { AsyncReturnType } from '../utils/types';
import { throttle } from '../utils/helpers';
import { Layer, Stage } from '@pixi/layers';

if (import.meta.env.DEV) {
  // @ts-ignore enables PIXI devtools
  window.PIXI = PIXI;
}

export type GameRenderer = AsyncReturnType<typeof createGameRenderer>;
export type CreateGameRendererOptions = {
  canvas: HTMLCanvasElement;
};

export const SCALE = 2;

export const overlayLayer = new Layer();
export const spriteLayer = new Layer();
export const itemLayer = new Layer();
export const mapLayer = new Layer();

export const createGameRenderer = async ({
  canvas
}: CreateGameRendererOptions) => {
  const { width, height } = canvas.getBoundingClientRect();
  const app = new PIXI.Application({
    width,
    height,
    autoDensity: true,
    antialias: false,
    backgroundAlpha: 0,
    view: canvas,
    resizeTo: canvas.parentElement!
  });

  app.stage = new Stage();

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  app.stage.scale.set(SCALE);
  app.stage.sortableChildren = true;
  app.stage.addChild(mapLayer, itemLayer, spriteLayer, overlayLayer);

  const onWindowResize = throttle(() => {
    app.resize();
  }, 100);
  window.addEventListener('resize', onWindowResize);

  app.stage.interactive = true;

  return {
    app,
    cleanup() {
      window.removeEventListener('resize', onWindowResize);
      app.destroy();
    }
  };
};
