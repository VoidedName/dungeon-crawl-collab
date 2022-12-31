import * as PIXI from 'pixi.js';
import type { AsyncReturnType } from '../utils/types';
import { throttle } from '../utils/helpers';

if (import.meta.env.DEV) {
  // @ts-ignore enables PIXI devtools
  window.PIXI = PIXI;
}

export type GameRenderer = AsyncReturnType<typeof createGameRenderer>;
export type CreateGameRendererOptions = {
  canvas: HTMLCanvasElement;
};

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

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  const SCALE = 2;
  app.stage.scale.set(SCALE);
  app.stage.sortableChildren = true;

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
