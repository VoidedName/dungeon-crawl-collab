import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Position } from '@/entity/components/Position';
import type { GameMap } from '@/map/Map';
import { TILE_SIZE } from '@/MapManager';

export const EntityLocationIndexSystem: ECSSystem<[Position]> = {
  target: ['position'],
  run: (w, p, entities) => {
    w.get<GameMap>('map').match(
      map => {
        map.clearEntities();
        entities.forEach(e => {
          const x = Math.floor(e.position.x / TILE_SIZE);
          const y = Math.floor(e.position.y / TILE_SIZE);
          if (x < 0 || x >= map.width || y < 0 || y >= map.height) return;
          map.getEntities(x, y).push(e.entity_id);
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }
};
