import type { ECSSystem } from '@/ecs/ECSSystem';
import { maps, TILE_SIZE, type TMap } from '@/MapManager';
import { Application, Container, Graphics, Text } from 'pixi.js';
import type { ECSWorld } from '@/ecs/ECSWorld';
import * as console from 'console';

export const DebugFlags = {
  map: 'debug:map' as const
} satisfies Record<string, string>;

export const DebugRenderer: (
  app: Application,
  world: ECSWorld
) => ECSSystem<[]> = (app, world) => {
  let currentStage = -1;
  const debugContainer = new Container();
  app.stage.addChild(debugContainer);

  return {
    target: [],
    run: () => {
      const debugging = world
        .get<boolean>(DebugFlags.map)
        .getOrElse(() => false);
      if (!debugging) return;

      world.get<TMap>('map').match(
        map => {
          if (map.level === currentStage) return;
          currentStage = map.level;

          debugContainer.removeChildren();
          const stage = maps[map.level]!;
          stage.forEach((row, y) =>
            row.forEach((tile, x) => {
              const graphics = new Graphics();
              let tileColor;
              let label;
              switch (tile) {
                case 0:
                  tileColor = 0xffff00;
                  label = 'outside';
                  break;
                case 1:
                case 2:
                case 3:
                case 4:
                  tileColor = 0x000000;
                  label = 'wall';
                  break;
                default:
                  label = 'n/a';
                  tileColor = 0xff0000;
              }

              graphics.beginFill(0, 0);
              graphics.lineStyle(1, tileColor);

              graphics.drawRect(
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE - 1,
                TILE_SIZE - 1
              );
              const labelData = new Text(label, {
                align: 'center',
                fontSize: 12,
                fill: tileColor
              });
              labelData.x = x * TILE_SIZE + TILE_SIZE / 2;
              labelData.y = y * TILE_SIZE + TILE_SIZE / 2;
              labelData.anchor.set(0.5, 0.5);
              debugContainer.addChild(graphics);
              graphics.addChild(labelData);
            })
          );
        },
        () => console.warn('Can not show debug grid, no map present!')
      );
    }
  };
};
