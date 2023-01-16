<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import type { ECSEvent } from '@/createGameLoop';
import type {
  InventoryBelt,
  TInventoryManager,
  TItem
} from '@/createInventoryManager';
import { BELT_SIZE } from '@/createInventoryManager';
import ItemBeltSlot from './ItemBeltSlot.vue';

let inventoryManager: TInventoryManager;

const ecsApi = useEcsApi();
const belt = ref<InventoryBelt>(Array.from<TItem>({ length: BELT_SIZE }));

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
  <ol class="belt">
    <ItemBeltSlot
      @click="useItem(index)"
      v-for="(item, index) in belt"
      :item="item"
      :slot="index + 1"
    />
  </ol>
</template>

<style scoped>
.belt {
  position: fixed;
  bottom: 0px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
}
</style>
