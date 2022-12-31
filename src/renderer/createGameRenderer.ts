import * as PIXI from 'pixi.js';
import type { AsyncReturnType } from '../utils/types';
import { throttle } from '../utils/helpers';
import { createSprite } from './createSprite';
import testMap from '@/assets/tilesets/test-map.png';
import { loadMap } from '@/MapManager';
import { createGameLoop } from '@/createGameLoop';
import { addEntity } from '@/EntityManager';
import { PLAYER_SPEED, type TPlayerEntity } from '@/PlayerEntity';

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
    backgroundAlpha: 0,
    view: canvas,
    resizeTo: canvas.parentElement!
  });

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  const SCALE = 2;
  app.stage.scale.set(SCALE);
  const map = PIXI.Sprite.from(testMap);

  map.anchor.set(0.5, 0.5);
  map.position.set(app.screen.width / 4, app.screen.height / 4);
  app.stage.addChild(map);
  const onWindowResize = throttle(() => {
    app.resize();
  }, 100);
  window.addEventListener('resize', onWindowResize);

  const addTestSprite = async () => {
    const wizard = await createSprite({
      id: 'wizard',
      initialAnimation: 'idle'
    });
    wizard.container.position.set(
      app.screen.width / (2 * SCALE),
      app.screen.height / (2 * SCALE)
    );

    app.stage.interactive = true;

    app.stage.addChild(wizard.container);

    return wizard;
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
