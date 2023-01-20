<script setup lang="ts">
import InventorySlot from './InventorySlot.vue';
import Surface from './ui/Surface.vue';
const inventorySlots = new Array(20).fill('');

const isOpened = ref(false);
useEventListener('keyup', e => {
  if (e.code === 'KeyI') isOpened.value = !isOpened.value;
});
</script>

<template>
  <Surface v-if="isOpened" class="inventory-hud">
    <div class="inventory">
      <div class="equip">
        <InventorySlot />
        <div class="row">
          <InventorySlot />
          <InventorySlot />
          <InventorySlot />
        </div>
        <InventorySlot />
        <InventorySlot />
      </div>
      <div class="backpack">
        <InventorySlot v-for="slot of inventorySlots" />
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
