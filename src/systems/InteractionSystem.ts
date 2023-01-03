import type { TAudioManager } from '@/createAudioManager';
import type { TEffectManager } from '@/createEffectManager';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Interactable } from '@/entity/components/Interactable';
import type { InteractIntent } from '@/entity/components/InteractIntent';
import type { Player } from '@/entity/components/Player';
import type { Position } from '@/entity/components/Position';
import type { Renderable } from '@/entity/components/Renderable';
import { loadMap, type TMap } from '@/MapManager';
import { dist } from '@/utils/math';
import type { Application } from 'pixi.js';
import type { DisplayObject } from 'pixi.js';
import { immoveableComponent } from '@/entity/components/Immoveable';

export const InteractionSystem: (
  resolveSprite: (sprite: ECSEntityId) => DisplayObject,
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
      const text = resolveSprite(interactable.entity_id);
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

          if (
            ['stairsUp', 'stairsDown'].includes(interactable.interactable.type)
          ) {
            world.addComponent(player, immoveableComponent);
            world.get<TAudioManager>('audio').match(
              audioManager => {
                audioManager.play('stairs');
              },
              () => console.warn('no audio manager set')
            );
            world.get<TEffectManager>('effects').match(
              effectsManager => {
                effectsManager.fadeScreenOut(() => {
                  world.removeComponent(player, 'immoveable');
                  if (interactable.interactable.type === 'stairsUp') {
                    mapGlobal.level--;
                    loadMap(mapGlobal.level, false, app, world);
                  } else if (interactable.interactable.type === 'stairsDown') {
                    mapGlobal.level++;
                    loadMap(mapGlobal.level, true, app, world);
                  }
                });
              },
              () => console.warn('no audio manager set')
            );
          }
        }
      }
    });
  }
});
