export type TEffectManager = ReturnType<typeof createEffectManager>;
import { Graphics, type Application } from 'pixi.js';

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
        overlay.alpha += 0.05;
        if (overlay.alpha >= 1) {
          clearInterval(interval);
          overlay.destroy();
          onEffectDone();
        }
      }, 20);
    }
  };
}
