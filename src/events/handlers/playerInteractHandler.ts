import type { TAudioManager } from '@/createAudioManager';
import type { TEffectManager } from '@/createEffectManager';
import type { TInventoryManager } from '@/createInventoryManager';
import type { ECSEntity, ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { immoveableComponent } from '@/entity/components/Immoveable';
import {
  hasInteractable,
  type Interactable
} from '@/entity/components/Interactable';
import { hasInteractIntent } from '@/entity/components/InteractIntent';
import { hasItem } from '@/entity/components/Item';
import { hasPosition, type Position } from '@/entity/components/Position';
import type { Renderable } from '@/entity/components/Renderable';
import { simpleMapGen, type GameMap } from '@/map/Map';
import { loadMap } from '@/MapManager';
import { resolveRenderable } from '@/renderer/renderableManager';
import { TEXT_OBJECT_NAME } from '@/systems/InteractionSystem';
import { getPlayer } from '@/utils/getPlayer';
import { dist } from '@/utils/math';
import type { Random } from '@/utils/rand/random';
import type { Application, DisplayObject, Sprite } from 'pixi.js';

function handleItemInteraction(
  world: ECSWorld,
  itemEntity: ECSEntity,
  text: DisplayObject,
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject
) {
  if (!hasInteractable(itemEntity) || !hasItem(itemEntity)) return;
  const inventoryManager = world.get<TInventoryManager>('inventory').unwrap();

  if (!itemEntity.interactable.isEnabled) return;
  if (inventoryManager.isFull()) return;

  itemEntity.interactable.isEnabled = false;
  if (text) {
    text.visible = false;
  }

  inventoryManager.addItemToBelt(itemEntity.item.type);
  world.get<TAudioManager>('audio').unwrap().play('pickup');
  world.removeComponent(itemEntity, 'position');
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

export const playerInteractHandler = (
  isInteracting: boolean,
  world: ECSWorld,
  app: Application
) => {
  const player = getPlayer(world);
  if (!hasPosition(player) || !hasInteractIntent(player)) return;
  if (!player) return;
  if (!isInteracting) return;
  player.interact_intent.isInteracting = isInteracting;

  const interactables = world.entitiesByComponent<
    [Interactable, Renderable, Position]
  >(['interactable', 'renderable', 'position']);

  for (const interactable of interactables) {
    const parentSprite = resolveRenderable(interactable.entity_id) as Sprite;
    const text = parentSprite.getChildByName(TEXT_OBJECT_NAME);

    const distance = dist(
      {
        x: interactable.position.x + parentSprite.width / 2,
        y: interactable.position.y + parentSprite.height / 2
      },
      player.position
    );
    const isNear = distance < interactable.interactable.interactionRadius;

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

      if (['stairsUp', 'stairsDown'].includes(interactable.interactable.type)) {
        handleStairsInteraction(world, player, interactable, app);
      } else if (interactable.interactable.type === 'item') {
        handleItemInteraction(world, interactable, text, resolveRenderable);
      }
      break;
    }
  }
};
