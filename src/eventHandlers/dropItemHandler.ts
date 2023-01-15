import type { TItem } from '@/createInventoryManager';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { hasInteractable } from '@/entity/components/Interactable';
import { hasItem } from '@/entity/components/Item';
import { hasPosition, positionComponent } from '@/entity/components/Position';
import { renderableComponent } from '@/entity/components/Renderable';
import { getPlayer } from '@/utils/getPlayer';
import type { ResolveRenderable } from '@/utils/types';
import type { Sprite } from 'pixi.js';

export const dropItemHandler = (
  item: TItem,
  ecs: ECSWorld,
  resolveRenderable: ResolveRenderable
) => {
  const itemEntity = ecs.getEntity(item.entityId).unwrap();
  const player = getPlayer(ecs);
  if (
    !hasItem(itemEntity) ||
    !hasInteractable(itemEntity) ||
    !hasPosition(player)
  )
    return;

  itemEntity.interactable.isEnabled = true;

  ecs.addComponent(
    itemEntity.entity_id,
    positionComponent({
      x: player.position.x,
      y: player.position.y
    })
  );
  ecs.addComponent(itemEntity, renderableComponent);

  const itemSprite = resolveRenderable(itemEntity.entity_id) as Sprite;
  itemSprite.visible = true;
};
