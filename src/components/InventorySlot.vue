<script setup lang="ts">
import type {
  InventoryStash,
  TInventoryManager,
  TItem
} from '@/createInventoryManager';
import { sprites } from '@/assets/sprites';
import type { Nullable } from '@/utils/types';
import { useEcsApi } from '@/composables/useEcsApi';
import type { ECSEvent } from '@/events/createExternalQueue';

const props = defineProps<{
  inventoryManager: TInventoryManager;
  item: Nullable<TItem>;
  slot: number;
}>();

const bg = computed(() => {
  if (!props.item) return 'transparent';
  const { url } = sprites[props.item.item.spriteName];
  return `url(${url})`;
});

function startDrag(evt: DragEvent, index: number) {
  if (!evt.dataTransfer) return;
  evt.dataTransfer.setData('slot', index + '');
  evt.dataTransfer.setData('from', 'stash');
}

function handleDrop(evt: DragEvent) {
  if (!evt.dataTransfer) return;
  const slot = evt.dataTransfer.getData('slot');
  const from = evt.dataTransfer.getData('from');
  props.inventoryManager?.swapItem(from, Number(slot), 'stash', props.slot - 1);
}
</script>

<template>
  <li
    class="inventory-slot"
    droppable="true"
    @drop="handleDrop($event)"
    @dragenter.prevent
    @dragover.prevent
  >
    <span>{{ props.slot }}</span>

    <button
      :draggable="!!props.item"
      @dragstart="startDrag($event, props.slot - 1)"
      :title="item?.item.spriteName"
    />
  </li>
</template>

<style scoped>
.inventory-slot {
  position: relative;
  height: 64px;
  width: 64px;
  border: 1px solid black;
  color: white;
  background: var(--color-surface);
  display: grid;
}

.inventory-slot > span {
  content: v-bind('props.slot');
  position: absolute;
  top: 0;
  left: 0;
}

.inventory-slot > button {
  background: v-bind(bg);
  background-size: cover;
  image-rendering: pixelated;
}

.inventory-slot > button:hover,
.inventory-slot > button:focus {
  filter: brightness(125%);
}
</style>
