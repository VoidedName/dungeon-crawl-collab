import type { Application } from 'pixi.js';
import { getEntityById } from './EntityManager';
import { updatePlayer, type TPlayerEntity } from './PlayerEntity';

export function createGameLoop(app: Application) {
  function tick() {
    const player = getEntityById('player')! as unknown as TPlayerEntity;

    updatePlayer(player);

    const { x: playerX, y: playerY } = player.sprite.position;
    const cx = playerX - app.screen.width / 2;
    const cy = playerY - app.screen.height / 2;

    app.stage.position.set(-cx, -cy);

    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}
