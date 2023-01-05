import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { PoisonBrand } from '@/entity/components/Poison';
import type { Poison } from '@/entity/components/Poison';
import { EventNames, type GameLoopQueue } from '@/createGameLoop';

const DAMAGE_INTERVAL = 1000;

let lastTick = Date.now();

export const PoisonSystem: (
  queue: GameLoopQueue
) => ECSSystem<[Poison, Renderable, Stats]> = queue => ({
  target: [PoisonBrand, RenderableBrand, StatsBrand],
  run: (ecs, props, entities) => {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;

    entities.forEach(entity => {
      if (entity.poison.duration !== Number.POSITIVE_INFINITY) {
        entity.poison.duration -= delta;
      }
      entity.poison.nextDamageIn -= delta;
      if (entity.poison.nextDamageIn <= 0) {
        entity.poison.nextDamageIn = DAMAGE_INTERVAL;
        queue.dispatch({
          type: EventNames.DAMAGE,
          payload: {
            entityId: entity.entity_id,
            damage: entity.poison.damage
          }
        });
      }

      if (entity.poison.duration <= 0) {
        ecs.removeComponent(entity, PoisonBrand);
      }
    });
  }
});
