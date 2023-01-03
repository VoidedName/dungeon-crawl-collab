import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Application, DisplayObject, Sprite } from 'pixi.js';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import type { RenderableId } from '@/renderer/renderableCache';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { PoisionBrand } from '@/entity/components/Poision';
import type { Poision } from '@/entity/components/Poision';
import { flashRed } from '@/createEffectManager';
import { deleteComponent } from '@/entity/components/Delete';

const DAMAGE_INTERVAL = 1000;

let lastTick = Date.now();

export const PoisionSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  app: Application
) => ECSSystem<[Poision, Renderable, Stats]> = (resolveSprite, app) => ({
  target: [PoisionBrand, RenderableBrand, StatsBrand],
  run: (ecs, props, entities) => {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;

    entities.forEach(entity => {
      if (entity.poision.duration !== Number.POSITIVE_INFINITY) {
        entity.poision.duration -= delta;
      }
      if (entity.poision.duration <= 0) {
        ecs.removeComponent(entity, PoisionBrand);
      }
      entity.poision.nextDamageIn -= delta;
      if (entity.poision.nextDamageIn <= 0) {
        entity.poision.nextDamageIn = DAMAGE_INTERVAL;
        entity.stats.current.health -= entity.poision.damage;
        flashRed(resolveSprite, entity.renderable.sprite);

        if (entity.stats.current.health <= 0) {
          ecs.addComponent(entity, deleteComponent);
        }
      }
    });
  }
});
