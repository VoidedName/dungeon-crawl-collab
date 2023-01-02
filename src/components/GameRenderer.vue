<script setup lang="ts">
import { useEcsApiProvider } from '@/composables/useEcsApi';
import { createGameLoop, type ECSApi } from '@/createGameLoop';
import { createGameRenderer } from '@/renderer/createGameRenderer.js';
import PauseMenu from './PauseMenu.vue';

const canvasEl = ref<HTMLCanvasElement>();
const ecsApi = useEcsApiProvider();

const router = useRouter();

onMounted(async () => {
  if (!canvasEl.value) return;

  ecsApi.value = createGameLoop(
    await createGameRenderer({
      canvas: canvasEl.value
    }),
    path => router.push(path)
  );
});

onUnmounted(() => {
  ecsApi.value?.cleanup();
});
</script>

<template>
  <div class="game-renderer">
    <PauseMenu v-if="ecsApi" />
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
