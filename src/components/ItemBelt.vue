<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import type { ECSEvent } from '@/createGameLoop';
import type { TInventoryManager } from '@/createInventoryManager';
import { BELT_SIZE } from '@/createInventoryManager';

let inventoryManager: TInventoryManager;

const ecsApi = useEcsApi();
let belt = ref(new Array(BELT_SIZE).fill(undefined));

ecsApi.value.on((event: ECSEvent) => {
  if (event === 'ready') {
    inventoryManager = ecsApi.value
      ?.getGlobal<TInventoryManager>('inventory')
      .unwrap();

    belt.value = inventoryManager.getBelt();

    inventoryManager.on(inventoryEvent => {
      if (inventoryEvent === 'updated') {
        belt.value = inventoryManager.getBelt();
      }
    });
  }
});

function useItem(itemIndex: number) {
  inventoryManager?.useBeltItem(itemIndex);
}
</script>

<template>
  <ul class="belt">
    <li class="slot" @click="useItem(index)" v-for="(item, index) in belt">
      {{ index + 1 }}
      <i v-if="item">{{ item.name }}</i>
    </li>
  </ul>
</template>

<style scoped>
.belt {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
}
.belt > .slot {
  height: 50px;
  width: 50px;
  border: 1px solid black;
  color: white;
  background: rgba(208, 180, 145, 0.3);
}

.belt > .slot > i {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
