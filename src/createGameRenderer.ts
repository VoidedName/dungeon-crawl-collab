import * as PIXI from 'pixi.js';
import type { AsyncReturnType } from './utils/types';
import { throttle } from './utils/helpers';
import { createEntitySprite } from './createEntitySprite';
import { createGameLoop } from './createGameLoop';
import { addEntity } from './EntityManager';
import { PLAYER_SPEED, type TPlayerEntity } from './PlayerEntity';
import { loadMap } from './MapManager';

if (import.meta.env.DEV) {
  // @ts-ignore enables PIXI devtools
  window.PIXI = PIXI;
}

export type GameRenderer = AsyncReturnType<typeof createGameRenderer>;
export type CreateGameRendererOptions = {
  canvas: HTMLCanvasElement;
};

let app: PIXI.Application;

export const createGameRenderer = async ({
  canvas
}: CreateGameRendererOptions) => {
  const { width, height } = canvas.getBoundingClientRect();
  app = new PIXI.Application({
    width,
    height,
    autoDensity: true,
    antialias: false,
    background: 0x000000,
    view: canvas,
    resizeTo: canvas.parentElement!
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
    app.stage.addChild(sprite);
    return sprite;
  };

  await loadMap(app);

  const testSprite = await addTestSprite();
  addEntity({
    id: 1,
    sprite: testSprite,
    speed: PLAYER_SPEED
  } as TPlayerEntity);

  createGameLoop(app);

  return {
    cleanup() {
      window.removeEventListener('resize', onWindowResize);
      app.destroy();
    }
  };
};
