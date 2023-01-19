import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSSystem } from '@/ecs/ECSSystem';
import { hasInteractIntent } from '@/entity/components/InteractIntent';
import { hasPosition, type Position } from '@/entity/components/Position';
import { dist } from '@/utils/math';
import type { Application, DisplayObject, Sprite } from 'pixi.js';
import { getPlayer } from '@/utils/getPlayer';
import type { Renderable } from '@/entity/components/Renderable';
import type { Interactable } from '@/entity/components/Interactable';

export const TEXT_OBJECT_NAME = 'text';

export const InteractionSystem: (
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject,
  app: Application
) => ECSSystem<[Position, Interactable, Renderable]> = resolveRenderable => ({
  target: ['position', 'interactable', 'renderable'],
  run: (world, props, entities) => {
    entities.forEach(interactable => {
      const player = getPlayer(world);
      if (!hasPosition(player) || !hasInteractIntent(player)) return;
      if (!interactable.interactable.isEnabled) return;
      const parentSprite = resolveRenderable(interactable.entity_id) as Sprite;
      const distance = dist(interactable.position, player.position);
      const isNear = distance < interactable.interactable.interactionRadius;
      const text = parentSprite.getChildByName(TEXT_OBJECT_NAME);
      const shouldHighlightInteractables = world
        .get<boolean>('highlightInteractables')
        .unwrap();

      if (text) {
        text.visible = isNear || shouldHighlightInteractables;
      }
    });
  }
});
