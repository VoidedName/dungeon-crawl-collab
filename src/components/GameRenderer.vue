<script setup lang="ts">
import { useEcsApiProvider } from '@/composables/useEcsApi';
import { createGameLoop, type ECSApi } from '@/createGameLoop';
import { createGameRenderer } from '@/renderer/createGameRenderer.js';
import PauseMenu from './PauseMenu.vue';

const canvasEl = ref<HTMLCanvasElement>();
const ecsApi = useEcsApiProvider();

onMounted(async () => {
  if (!canvasEl.value) return;

  ecsApi.value = createGameLoop(
    await createGameRenderer({
      canvas: canvasEl.value
    })
  );
});

onUnmounted(() => {
  ecsApi.value?.cleanup();
});
</script>

<template>
  <div class="game-renderer">
    <PauseMenu />
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
