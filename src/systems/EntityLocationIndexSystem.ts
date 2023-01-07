import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Position } from '@/entity/components/Position';
import type { GameMap } from '@/map/Map';

export const EntityLocationIndexSystem: ECSSystem<[Position]> = {
  target: ['position'],
  run: (w, p, entities) => {
    w.get<GameMap>('map').match(
      map => {
        map.clearEntities();
        entities.forEach(e => {
          map.getEntities(e.position.x, e.position.y).push(e.entity_id);
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }
};
