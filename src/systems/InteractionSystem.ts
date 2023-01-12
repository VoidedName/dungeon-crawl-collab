import type { TAudioManager } from '@/createAudioManager';
import type { TEffectManager } from '@/createEffectManager';
import type { ECSEntity, ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  hasInteractable,
  type Interactable
} from '@/entity/components/Interactable';
import { hasInteractIntent } from '@/entity/components/InteractIntent';
import { hasPosition, type Position } from '@/entity/components/Position';
import { loadMap } from '@/MapManager';
import { dist } from '@/utils/math';
import type { Application, DisplayObject, Sprite } from 'pixi.js';
import { immoveableComponent } from '@/entity/components/Immoveable';
import type { GameMap } from '@/map/Map';
import { simpleMapGen } from '@/map/Map';
import type { Random } from '@/utils/rand/random';
import { getPlayer } from '@/utils/getPlayer';
import type { Renderable } from '@/entity/components/Renderable';
import type { TInventoryManager } from '@/createInventoryManager';
import { hasItem } from '@/entity/components/Item';
import type { ECSWorld } from '@/ecs/ECSWorld';

function handleItemInteraction(
  world: ECSWorld,
  itemEntity: ECSEntity,
  text: DisplayObject,
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject
) {
  if (!hasInteractable(itemEntity)) return;
  const inventoryManager = world.get<TInventoryManager>('inventory').unwrap();

  if (inventoryManager.isFull()) return;

  itemEntity.interactable.isEnabled = false;
  if (text) {
    text.visible = false;
  }
  if (hasItem(itemEntity)) {
    inventoryManager.addItemToBelt(itemEntity.item.type);
  }

  world.removeComponent(itemEntity.entity_id, 'position');
  world.removeComponent(itemEntity, 'renderable');

  const itemSprite = resolveRenderable(itemEntity.entity_id);
  itemSprite.visible = false;
}

function handleStairsInteraction(
  world: ECSWorld,
  player: ECSEntity,
  stairsEntity: Interactable,
  app: Application
) {
  const mapGlobal = world.get<GameMap>('map').unwrap();
  const worldMap = world.get<GameMap[]>('world map').unwrap();

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
        let nextMap = 0;
        let spawnAtStarisUp = false;
        if (stairsEntity.interactable.type === 'stairsUp') {
          nextMap = mapGlobal.level - 1;
        } else if (stairsEntity.interactable.type === 'stairsDown') {
          nextMap = mapGlobal.level + 1;
          spawnAtStarisUp = true;
        }
        if (worldMap[nextMap] === undefined) {
          worldMap[nextMap] = simpleMapGen(
            20 + Math.round(Math.sqrt(5 * nextMap + 1)),
            20 + Math.round(Math.sqrt(5 * nextMap + 1)),
            nextMap,
            3 + nextMap,
            world.get<Random>('rng').unwrap()
          );
        }
        loadMap(worldMap[nextMap]!, spawnAtStarisUp, app, world);
        world.set('map', worldMap[nextMap]!);
      });
    },
    () => console.warn('no audio manager set')
  );
}

export const InteractionSystem: (
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject,
  app: Application // TODO: ecs shouldn't know about pixi
) => ECSSystem<[Position, Interactable, Renderable]> = (
  resolveRenderable,
  app
) => ({
  target: ['position', 'interactable', 'renderable'],
  run: (world, props, entities) => {
    entities.forEach(interactable => {
      const player = getPlayer(world);
      if (!hasPosition(player) || !hasInteractIntent(player)) return;
      if (!interactable.interactable.isEnabled) return;
      const parentSprite = resolveRenderable(interactable.entity_id) as Sprite;
      const distance = dist(
        {
          x: interactable.position.x + parentSprite.width / 2,
          y: interactable.position.y + parentSprite.height / 2
        },
        player.position
      );
      const isNear = distance < interactable.interactable.interactionRadius;
      const text = parentSprite.getChildByName('text');

      if (text) {
        text.visible = isNear;
      }

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

        if (
          ['stairsUp', 'stairsDown'].includes(interactable.interactable.type)
        ) {
          handleStairsInteraction(world, player, interactable, app);
        } else if (interactable.interactable.type === 'item') {
          handleItemInteraction(world, interactable, text, resolveRenderable);
        }
      }
    });
  }
});
