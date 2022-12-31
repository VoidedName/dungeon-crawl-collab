import type { ECSSystem } from '@/ecs/ECSSystem';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import { PositionBrand, type Position } from '@/entity/components/Position';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import { SCALE } from '@/renderer/createGameRenderer';
import type { RenderableId } from '@/renderer/renderableCache';
import type { Application, DisplayObject } from 'pixi.js';

export const CameraSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  app: Application
) => ECSSystem<[Player, Position, Renderable]> = (resolveSprite, app) => ({
  target: [PlayerBrand, PositionBrand, RenderableBrand],
  run: entities => {
    const player = entities[0];
    if (!app || !player) return;

    const { x: playerX, y: playerY } = player.position;
    const cx = playerX * -1 * SCALE + app.screen.width / 2;

    const cy = playerY * -1 * SCALE + app.screen.height / 2;
    app.stage.position.set(cx, cy);
  }
});
