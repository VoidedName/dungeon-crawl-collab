<script setup lang="ts">
import { createGameRenderer, type GameRenderer } from '@/createGameRenderer.js';

const canvasEl = ref<HTMLCanvasElement>();
let renderer: GameRenderer;

onMounted(async () => {
  if (!canvasEl.value) return;
  renderer = await createGameRenderer({
    canvas: canvasEl.value
  });

  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';
});

onUnmounted(() => {
  renderer?.cleanup();
  document.body.style.overflow = '';
  document.body.style.height = '';
});
</script>

<template>
  <canvas ref="canvasEl" />
</template>

<style scoped>
canvas {
  height: 100vh;
}
</style>
