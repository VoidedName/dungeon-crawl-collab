import type { ECSSystem } from '@/ecs/ECSSystem';
import type { ECSWorld } from '@/ecs/ECSWorld';
import type { Interactable } from '@/entity/components/Interactable';
import type { InteractIntent } from '@/entity/components/InteractIntent';
import type { Player } from '@/entity/components/Player';
import type { Position } from '@/entity/components/Position';
import type { Renderable } from '@/entity/components/Renderable';
import { loadMap } from '@/MapManager';
import type { RenderableId } from '@/renderer/renderableCache';
import { dist } from '@/utils/math';
import type { Application } from 'pixi.js';
import type { DisplayObject } from 'pixi.js';

export const InteractionSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  app: Application, // TODO: ecs shouldn't know about pixi
  world: ECSWorld
) => ECSSystem<[Position, Interactable, Renderable]> = (
  resolveSprite,
  app,
  world
) => ({
  target: ['position', 'interactable', 'renderable'],
  run: entities => {
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

        if (interactable.interactable.type === 'stairsUp') {
          player.player.level--;
          loadMap(player.player.level, false, app, world);
        } else if (interactable.interactable.type === 'stairsDown') {
          player.player.level++;
          loadMap(player.player.level, true, app, world);
        }
      }
    });
  }
});
