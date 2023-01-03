import type { ECSSystem } from '@/ecs/ECSSystem';
import { CameraBrand, type Camera } from '@/entity/components/Camera';
import {
  PositionBrand,
  type Position,
  hasPosition
} from '@/entity/components/Position';
import { SCALE } from '@/renderer/createGameRenderer';
import { addVector } from '@/utils/vectors';
import type { Application } from 'pixi.js';
import { isDefined } from '@/utils/assertions';

export const CameraSystem: (
  app: Application
) => ECSSystem<[Camera, Position]> = app => ({
  target: [CameraBrand, PositionBrand],
  run: (ecs, props, entities) => {
    const [e] = entities;
    if (!e) return;

    const applyFollow = () => {
      if (!isDefined(e.camera.following)) return;

      const maybeEntity = ecs.getEntity(e.camera.following);

      if (!maybeEntity.isSome()) return;
      const player = maybeEntity.get();

      if (!hasPosition(player)) return;

      const { x: playerX, y: playerY } = player.position;
      e.position.x = playerX * -1 * SCALE + app.screen.width / 2;
      e.position.y = playerY * -1 * SCALE + app.screen.height / 2;
    };

    applyFollow();

    const withOffset = addVector(e.position, e.camera.offset);

    app.stage.position.set(withOffset.x, withOffset.y);
  }
});
