import type { ECSSystem } from '@/ecs/ECSSystem';
import type { ECSWorld } from '@/ecs/ECSWorld';
import type { Interactable } from '@/entity/components/Interactable';
import type { InteractIntent } from '@/entity/components/InteractIntent';
import type { Player } from '@/entity/components/Player';
import type { Position } from '@/entity/components/Position';
import type { Renderable } from '@/entity/components/Renderable';
import type { RenderableId } from '@/renderer/renderableCache';
import { dist } from '@/utils/math';
import type { DisplayObject } from 'pixi.js';

export const InteractionSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  world: ECSWorld
) => ECSSystem<[Position, Interactable, Renderable]> = (
  resolveSprite,
  world
) => ({
  target: ['position', 'interactable', 'renderable'],
  run: entities => {
    entities.forEach(e => {
      const player = world.entitiesByComponent<
        [Player, Position, InteractIntent]
      >(['player', 'position', 'interact_intent'])[0];
      if (!player) return;
      const distance = dist(e.position, player.position);
      const text = resolveSprite(e.renderable.sprite);
      text.visible = distance < e.interactable.interactionRadius;

      if (player.interact_intent.canInteract) {
        player.interact_intent.canInteract = false;
        player.interact_intent.isInteracting = false;
        setTimeout(() => {
          player.interact_intent.canInteract = true;
        }, player.interact_intent.cooldown);
        console.log('go down stairs');
      }
    });
  }
});
