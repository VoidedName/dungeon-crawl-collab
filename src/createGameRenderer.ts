import * as PIXI from 'pixi.js';
import type { AsyncReturnType } from './utils/types';
import { throttle } from './utils/helpers';
import { createEntitySprite } from './createEntitySprite';

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
  console.log(width, height);
  const app = new PIXI.Application({
    width,
    height,
    autoDensity: true,
    antialias: false,
    background: 0x000000,
    view: canvas
  });

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  const onWindowResize = throttle(() => app.resize(), 100);
  window.addEventListener('resize', onWindowResize);

  const addTestSprite = async () => {
    const sprite = await createEntitySprite({
      id: 'wizard',
      initialAnimation: 'idle'
    });
    sprite.position.set(app.screen.width / 2, app.screen.height / 2);
    canvas.addEventListener('mousemove', e => {
      sprite.position.set(e.clientX, e.clientY);
    });
    app.stage.addChild(sprite);
  };

  await addTestSprite();

  return {
    cleanup() {
      window.removeEventListener('resize', onWindowResize);
      app.destroy();
    }
  };
};
