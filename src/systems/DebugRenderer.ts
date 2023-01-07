import type { ECSSystem } from '@/ecs/ECSSystem';
import { maps, TILE_SIZE } from '@/MapManager';
import { Application, Container, Graphics, Text } from 'pixi.js';
import type { GameMap } from '@/map/Map';
import type { HitBoxes } from '@/entity/components/HitBoxes';
import type { Maybe } from '@/utils/Maybe';
import type { Rectangle } from '@/utils/types';

export const DebugFlags = {
  map: 'debug:map' as const,
  hitboxes: 'debug:hitboxes' as const
} satisfies Record<string, string>;
export type DebugFlags = typeof DebugFlags;

function drawHitbox(box: Maybe<Rectangle>, graphics: Graphics, color: number) {
  if (box.isSome()) {
    graphics.beginFill(color, 0.2);
    graphics.lineStyle(1, color);
    graphics.drawRect(box.get().x, box.get().y, box.get().w, box.get().h);
  }
}

export const DebugRenderer: (app: Application) => ECSSystem<[]> = app => {
  let currentStage = -1;
  const debugContainer = new Container();
  debugContainer.zIndex = Number.MAX_VALUE;

  const mapTiles = new Container();
  debugContainer.addChild(mapTiles);

  const hitboxes = new Container();
  debugContainer.addChild(hitboxes);

  app.stage.addChild(debugContainer);

  return {
    target: [],
    run: world => {
      const debugMap = world
        .get<boolean>(DebugFlags.map)
        .getOrElse(() => false);

      mapTiles.visible = debugMap;
      if (debugMap) {
        world.get<GameMap>('map').match(
          map => {
            if (map.level === currentStage) return;
            currentStage = map.level;

            mapTiles.removeChildren();
            for (const [x, y, tile] of map) {
              const graphics = new Graphics();
              let tileColor;
              let label = tile as string;
              switch (tile) {
                case 'FLOOR':
                  tileColor = 0xffffff;
                  break;
                case 'STAIRS_DOWN':
                  tileColor = 0xff0000;
                  break;
                case 'ENTRY':
                  tileColor = 0x00ff00;
                  break;
                case 'WALL':
                  tileColor = 0x000000;
                  break;
                default:
                  label = 'n/a';
                  tileColor = 0xff0000;
              }

              graphics.beginFill(tileColor, 0.2);
              graphics.lineStyle(1, tileColor);

              graphics.drawRect(
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE - 1,
                TILE_SIZE - 1
              );
              const labelData = new Text(label, {
                align: 'center',
                fontSize: 8,
                fill: tileColor
              });
              labelData.x = x * TILE_SIZE + TILE_SIZE / 2;
              labelData.y = y * TILE_SIZE + TILE_SIZE / 2;
              labelData.anchor.set(0.5, 0.5);
              mapTiles.addChild(graphics);
              graphics.addChild(labelData);
            }
          },
          () => console.warn('Can not show debug grid, no map present!')
        );
      }

      const debugHitboxes = world
        .get<boolean>(DebugFlags.hitboxes)
        .getOrElse(() => false);

      hitboxes.visible = debugHitboxes;

      if (debugHitboxes) {
        hitboxes.removeChildren();

        world.entitiesByComponent<[HitBoxes]>(['hitboxes']).forEach(e => {
          const graphics = new Graphics();
          drawHitbox(e.hitboxes.movement, graphics, 0xffffff);
          drawHitbox(e.hitboxes.hurt, graphics, 0xff0000);
          drawHitbox(e.hitboxes.damage, graphics, 0x00ffff);
          graphics.endFill();
          graphics.endFill();
          hitboxes.addChild(graphics);
        });
      }
    }
  };
};
