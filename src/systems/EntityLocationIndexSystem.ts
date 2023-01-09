import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Position } from '@/entity/components/Position';
import type { GameMap } from '@/map/Map';
import { getIntersectingTiles } from '@/utils/collisions';

export const EntityLocationIndexSystem: ECSSystem<[Position]> = {
  target: ['position'],
  run: (w, p, entities) => {
    w.get<GameMap>('map').match(
      map => {
        map.clearEntities();
        entities.forEach(e => {
          for (const [x, y] of getIntersectingTiles(e, map)) {
            map.getEntities(x, y).push(e.entity_id);
          }
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }
};
