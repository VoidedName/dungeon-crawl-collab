<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import type {
  InventoryStash,
  TInventoryManager,
  TItem
} from '@/createInventoryManager';
import { STASH_SIZE } from '@/createInventoryManager';
import type { ECSEvent } from '@/events/createExternalQueue';
import InventorySlot from './InventorySlot.vue';
import Surface from './ui/Surface.vue';

const isOpened = ref(false);
useEventListener('keyup', e => {
  if (e.code === 'KeyI') isOpened.value = !isOpened.value;
});

let inventoryManager: TInventoryManager;
const ecsApi = useEcsApi();
const inventorySlot = ref<InventoryStash>(
  Array.from<TItem>({ length: STASH_SIZE })
);

const equipmentSlot = ref<InventoryStash>(
  Array.from<TItem>({ length: STASH_SIZE })
);

ecsApi.value.on((event: ECSEvent) => {
  if (event === 'ready') {
    inventoryManager = ecsApi.value
      ?.getGlobal<TInventoryManager>('inventory')
      .unwrap();

    inventorySlot.value = inventoryManager.getStash();
    equipmentSlot.value = inventoryManager.getEquipment();

    inventoryManager.on(inventoryEvent => {
      if (inventoryEvent === 'updated') {
        inventorySlot.value = inventoryManager.getStash();
        equipmentSlot.value = inventoryManager.getEquipment();
      }
    });
  }
});

function useItem(itemIndex: number) {
  inventoryManager?.useStashItem(itemIndex);
}
</script>

<template>
  <Surface v-if="isOpened" class="inventory-hud">
    <div class="inventory">
      <div class="equip">
        <InventorySlot
          type="helmet"
          :inventory-manager="inventoryManager"
          :item="equipmentSlot[0]"
          :slot="1"
        />
        <div class="row">
          <InventorySlot
            type="primary"
            :inventory-manager="inventoryManager"
            :item="equipmentSlot[1]"
            :slot="2"
          />
          <!-- <InventorySlot type="armor" />
          <InventorySlot type="secondary" />  -->
        </div>
        <!-- <InventorySlot type="legs"/>
        <InventorySlot type="feet"/> -->
      </div>
      <div class="backpack">
        <InventorySlot
          :inventory-manager="inventoryManager"
          v-for="(item, index) of inventorySlot"
          @click="useItem(index)"
          :item="item"
          :slot="index + 1"
          type="stash"
        />
      </div>
    </div>
  </Surface>
</template>

<style scoped>
.inventory {
  display: flex;
  gap: 40px;
}

.equip {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.equip > .row {
  display: flex;
}

.backpack {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}
</style>
