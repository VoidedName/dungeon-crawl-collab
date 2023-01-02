<script setup lang="ts">
const props = withDefaults(defineProps<{ as?: string }>(), { as: 'div' });
</script>

<template>
  <component :is="props.as" class="surface">
    <slot />
  </component>
</template>

<style scoped lang="postcss">
.surface {
  background-color: var(--color-surface);
  backdrop-filter: blur(0.5rem);
  padding: var(--space-8);
  border: 1px solid var(--color-primary-quarter);
  border-radius: var(--radius-3);
  color: var(--color-on-surface);
  text-shadow: rgba(0, 0, 0, 0.7) 1px 0 0.2rem;
}
</style>
