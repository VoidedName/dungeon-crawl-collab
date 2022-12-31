<script setup lang="ts">
import { createGameLoop, type GameLoop } from '@/createGameLoop';
import {
  createGameRenderer,
  type GameRenderer
} from '@/renderer/createGameRenderer.js';

const canvasEl = ref<HTMLCanvasElement>();
let renderer: GameRenderer;
let loop: GameLoop;

onMounted(async () => {
  if (!canvasEl.value) return;
  renderer = await createGameRenderer({
    canvas: canvasEl.value
  });
  loop = await createGameLoop(renderer.app);
});

onUnmounted(() => {
  renderer?.cleanup();
  loop?.cleanup();
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
  display: block;
}
</style>
