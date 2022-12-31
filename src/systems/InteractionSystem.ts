import type { ECSSystem } from '@/ecs/ECSSystem';
import type { ECSWorld } from '@/ecs/ECSWorld';
import type { Interactable } from '@/entity/components/Interactable';
import type { Player } from '@/entity/components/Player';
import type { Position } from '@/entity/components/Position';
import type { Renderable } from '@/entity/components/Renderable';
import type { SpriteWrapper } from '@/renderer/createSprite';

export const InteractionSystem: (
  resolveSprite: (sprite: number) => SpriteWrapper,
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
      const dx = e.position.x - player.position.x;
      const dy = e.position.y - player.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const text = resolveSprite(e.renderable.sprite);
      text.visible = distance < 80;
    });
  }
});
