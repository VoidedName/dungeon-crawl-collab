import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Interactable } from '@/entity/components/Interactable';
import type { InteractIntent } from '@/entity/components/InteractIntent';
import type { Player } from '@/entity/components/Player';
import type { Position } from '@/entity/components/Position';
import type { Renderable } from '@/entity/components/Renderable';
import { loadMap, type TMap } from '@/MapManager';
import type { RenderableId } from '@/renderer/renderableCache';
import { dist } from '@/utils/math';
import type { Application } from 'pixi.js';
import type { DisplayObject } from 'pixi.js';

export const InteractionSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  app: Application // TODO: ecs shouldn't know about pixi
) => ECSSystem<[Position, Interactable, Renderable]> = (
  resolveSprite,
  app
) => ({
  target: ['position', 'interactable', 'renderable'],
  run: (world, props, entities) => {
    entities.forEach(interactable => {
      const player = world.entitiesByComponent<
        [Player, Position, InteractIntent]
      >(['player', 'position', 'interact_intent'])[0];
      if (!player) return;
      if (!interactable.interactable.isEnabled) return;
      const distance = dist(interactable.position, player.position);
      const text = resolveSprite(interactable.renderable.sprite);
      const isNear = distance < interactable.interactable.interactionRadius;
      text.visible = isNear;

      if (
        isNear &&
        player.interact_intent.canInteract &&
        player.interact_intent.isInteracting
      ) {
        player.interact_intent.canInteract = false;
        player.interact_intent.isInteracting = false;
        setTimeout(() => {
          player.interact_intent.isInteracting = false;
          player.interact_intent.canInteract = true;
        }, player.interact_intent.cooldown);

        const mapGlobalMaybe = world.get<TMap>('map');
        if (mapGlobalMaybe.isSome()) {
          const mapGlobal = mapGlobalMaybe.get();

          if (interactable.interactable.type === 'stairsUp') {
            mapGlobal.level--;
            loadMap(mapGlobal.level, false, app, world);
          } else if (interactable.interactable.type === 'stairsDown') {
            mapGlobal.level++;
            loadMap(mapGlobal.level, true, app, world);
          }
        }
      }
    });
  }
});
