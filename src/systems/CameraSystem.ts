import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Player, Position, Renderable } from '@/entity/Components';
import type { DisplayObject } from 'pixi.js';
import type { Application } from 'pixi.js';

export const CameraSystem: (
  resolveSprite: (sprite: number) => DisplayObject,
  app: Application
) => ECSSystem<[Player, Position, Renderable]> = (resolveSprite, app) => ({
  target: ['player', 'position', 'renderable'],
  run: entities => {
    const player = entities[0];
    if (!app || !player) return;

    const playerSprite = resolveSprite(player.renderable.sprite);
    const { x: playerX, y: playerY } = player.position;
    const cx =
      playerX - app.screen.width / 2 + playerSprite.getBounds().width / 2;
    const cy =
      playerY - app.screen.height / 2 + playerSprite.getBounds().height / 2;
    app.stage.position.set(-cx, -cy);
  }
});
