<script setup lang="ts">
const props = withDefaults(defineProps<{ as?: string }>(), { as: 'div' });
</script>

<template>
  <component :is="props.as" class="container"><slot /></component>
</template>

<style scoped>
.container {
  --container-size: var(--breakpoints-xl);
  margin-inline: auto;
  width: 100%;
  max-width: var(--container-size);
}
</style>
