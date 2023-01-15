<script setup lang="ts">
import type { TItem } from '@/createInventoryManager';
import { sprites } from '@/assets/sprites';
import type { Nullable } from '@/utils/types';

const props = defineProps<{ item: Nullable<TItem>; slot: number }>();

const bg = computed(() => {
  if (!props.item) return 'transparent';
  const { url } = sprites[props.item.item.spriteName];
  return `url(${url})`;
});

function startDrag(evt: DragEvent, index: number) {
  if (!evt.dataTransfer) return;
  evt.dataTransfer.setData('slot', index + '')
}
</script>

<template>
  <li class="item-belt-slot">
    <span>{{ props.slot }}</span>

    <button 
      draggable="true"
      @dragstart="startDrag($event, props.slot - 1)"
      :title="item?.item.spriteName" />
  </li>
</template>

<style scoped>
.item-belt-slot {
  position: relative;
  height: 64px;
  width: 64px;
  border: 1px solid black;
  color: white;
  background: var(--color-surface);
  display: grid;
}

.item-belt-slot > span {
  content: v-bind('props.slot');
  position: absolute;
  top: 0;
  left: 0;
}

.item-belt-slot > button {
  background: v-bind(bg);
  background-size: cover;
  image-rendering: pixelated;
}

.item-belt-slot > button:hover,
.item-belt-slot > button:focus {
  filter: brightness(125%);
}
</style>
