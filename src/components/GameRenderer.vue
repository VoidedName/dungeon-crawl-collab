<script setup lang="ts">
import {
  createGameRenderer,
  type GameRenderer
} from '@/renderer/createGameRenderer.js';

const canvasEl = ref<HTMLCanvasElement>();
let renderer: GameRenderer;

onMounted(async () => {
  if (!canvasEl.value) return;
  renderer = await createGameRenderer({
    canvas: canvasEl.value
  });
});

onUnmounted(() => {
  renderer?.cleanup();
});
</script>

<template>
  <div class="game-renderer">
    <canvas ref="canvasEl" />
  </div>
</template>

<style scoped>
.game-renderer {
  height: 100%;
}
canvas {
  margin-inline: auto;
  display: block;
}
</style>
