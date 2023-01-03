export type TEffectManager = ReturnType<typeof createEffectManager>;
import { DisplayObject, Graphics, Sprite, type Application } from 'pixi.js';
import type { RenderableId } from './renderer/renderableCache';

export function flashRed(
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  spriteId: RenderableId
) {
  const FLASH_DURATION = 150;
  const playerSprite = resolveSprite(spriteId) as Sprite;
  playerSprite.tint = 0xff0000;
  setTimeout(() => {
    playerSprite.tint = 0xffffff;
  }, FLASH_DURATION);
}

export function createEffectManager(app: Application) {
  return {
    async fadeScreenOut(onEffectDone: () => void) {
      const overlay = new Graphics();
      overlay.beginFill(0x000000);
      overlay.alpha = 0;
      overlay.drawRect(-10000, -10000, 20000, 20000);
      overlay.zIndex = 100;
      app.stage.addChild(overlay);

      const interval = setInterval(() => {
        overlay.alpha += 0.025;
        if (overlay.alpha >= 1) {
          clearInterval(interval);
          overlay.destroy();
          onEffectDone();
        }
      }, 20);
    }
  };
}
