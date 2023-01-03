import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Application, DisplayObject } from 'pixi.js';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { PoisonBrand } from '@/entity/components/Poison';
import type { Poison } from '@/entity/components/Poison';
import { flashRed } from '@/createEffectManager';
import { deleteComponent } from '@/entity/components/Delete';
import type { ECSEntityId } from '@/ecs/ECSEntity';

const DAMAGE_INTERVAL = 1000;

let lastTick = Date.now();

export const PoisonSystem: (
  resolveSprite: (sprite: ECSEntityId) => DisplayObject,
  app: Application
) => ECSSystem<[Poison, Renderable, Stats]> = resolveSprite => ({
  target: [PoisonBrand, RenderableBrand, StatsBrand],
  run: (ecs, props, entities) => {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;

    entities.forEach(entity => {
      if (entity.poison.duration !== Number.POSITIVE_INFINITY) {
        entity.poison.duration -= delta;
      }
      if (entity.poison.duration <= 0) {
        ecs.removeComponent(entity, PoisonBrand);
      }
      entity.poison.nextDamageIn -= delta;
      if (entity.poison.nextDamageIn <= 0) {
        entity.poison.nextDamageIn = DAMAGE_INTERVAL;
        entity.stats.current.health -= entity.poison.damage;
        flashRed(resolveSprite, entity.entity_id);

        if (entity.stats.current.health <= 0) {
          ecs.addComponent(entity, deleteComponent);
        }
      }
    });
  }
});
