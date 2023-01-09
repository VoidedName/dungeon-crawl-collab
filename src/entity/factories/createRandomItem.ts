import type { ECSWorld } from '../../ecs/ECSWorld';
import { createAnimatedSprite } from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { positionComponent } from '@/entity/components/Position';
import { renderableComponent } from '../components/Renderable';
import type { Point } from '@/utils/types';
import { sizeComponent } from '../components/Size';
import type { CodexItem } from '@/assets/types';
import { healthPotion } from '@/assets/codex/items/health-potion';
import { withInteractable } from '@/entity/components/Interactable';
import { Text } from 'pixi.js';
import { withMapObject } from '../components/MapObject';
import { parentComponent } from '../components/Parent';
import { itemComponent } from '../components/Item';
import { codex } from '@/assets/codex';

const lootableItems: (() => CodexItem)[] = [healthPotion];

export type RandomItemEntity = ReturnType<typeof createRandomItem>;
export const createRandomItem = (
  world: ECSWorld,
  options: {
    position: Point;
  }
) => {
  const randomItem =
    lootableItems[Math.floor(Math.random() * lootableItems.length)];

  if (!randomItem) return;

  const codexItem = randomItem();

  const sprite = createAnimatedSprite(
    codexItem.spriteName,
    AnimationState.IDLE
  );

  const item = world
    .createEntity()
    .with(positionComponent(options.position))
    .with(sizeComponent({ w: 16, h: 16 }))
    .with(renderableComponent)
    .with(withAnimatable(codexItem.spriteName))
    .with(withMapObject())
    .with(
      itemComponent({
        type: {
          item: codex.items.healthPotion(),
          isUseable: true // TODO: this seems weird living here instead of part of the health potion
        }
      })
    )
    .build();

  registerRenderable(item.entity_id, sprite);

  const text = new Text('potion', {
    fontFamily: 'Arial',
    fontSize: 18,
    fill: 0xffffff,
    align: 'center'
  });

  text.scale.set(0.5, 0.5);
  text.visible = false;

  const textEntity = world
    .createEntity()
    .with(withInteractable('potion', 'item', true, 50))
    .with(withMapObject())
    .with(
      positionComponent({
        x: options.position.x - 16,
        y: options.position.y - 20
      })
    )
    .with(parentComponent({ entity: item }))
    .with(renderableComponent)
    .build();

  registerRenderable(textEntity.entity_id, text);
  return item;
};
