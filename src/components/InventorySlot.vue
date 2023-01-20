<script setup lang="ts"></script>

<template>
  <li class="inventory-slot">
    <span></span>
  </li>
</template>

<style scoped>
.inventory {
  position: absolute;
}

.inventory-slot {
  position: relative;
  height: 64px;
  width: 64px;
  border: 1px solid black;
  color: white;
  background: var(--color-surface);
  display: grid;
}
</style>
