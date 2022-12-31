import type { ECSSystem } from '@/ecs/ECSSystem';
import { PlayerBrand, type Player } from '@/entity/Player';
import { PositionBrand, type Position } from '@/entity/Position';
import { RenderableBrand, type Renderable } from '@/entity/Renderable';
import type { SpriteWrapper } from '@/renderer/createSprite';
import type { Application } from 'pixi.js';

export const CameraSystem: (
  resolveSprite: (sprite: number) => SpriteWrapper,
  app: Application
) => ECSSystem<[Player, Position, Renderable]> = (resolveSprite, app) => ({
  target: [PlayerBrand, PositionBrand, RenderableBrand],
  run: entities => {
    const player = entities[0];
    if (!app || !player) return;

    const { sprite } = resolveSprite(player.renderable.sprite);
    const { x: playerX, y: playerY } = player.position;
    const cx = playerX - app.screen.width / 2 + sprite.getBounds().width / 2;
    const cy = playerY - app.screen.height / 2 + sprite.getBounds().height / 2;
    app.stage.position.set(-cx, -cy);
  }
});
