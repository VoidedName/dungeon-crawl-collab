import type { ECSSystem } from '@/ecs/ECSSystem';
import type { ECSWorld } from '@/ecs/ECSWorld';
import type { Interactable } from '@/entity/components/Interactable';
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
      const player = world.entitiesByComponent<[Player, Position]>([
        'player',
        'position'
      ])[0];
      if (!player) return;
      const distance = dist(e.position, player.position);
      const text = resolveSprite(e.renderable.sprite);
      text.visible = distance < 80;
    });
  }
});
