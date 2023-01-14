<script setup lang="ts">
import { useEcsApiProvider } from '@/composables/useEcsApi';
import { createGameLoop, type ECSEvent } from '@/createGameLoop';
import { createGameRenderer } from '@/renderer/createGameRenderer.js';
import PauseMenu from './PauseMenu.vue';
import SettingsMenu from './SettingsMenu.vue';
import ItemBelt from './ItemBelt.vue';
import HealthHud from './HealthHud.vue';
import { store } from '@/store';
import type { TInventoryManager } from '@/createInventoryManager';

const canvasEl = ref<HTMLCanvasElement>();
const ecsApi = useEcsApiProvider();

const router = useRouter();
let inventoryManager: TInventoryManager | undefined;

onMounted(async () => {
  if (!canvasEl.value) return;

  ecsApi.value = createGameLoop(
    await createGameRenderer({
      canvas: canvasEl.value
    }),
    path => router.push(path)
  );

  ecsApi.value.on((event: ECSEvent) => {
    if (event === 'ready') {
      inventoryManager = ecsApi.value
        ?.getGlobal<TInventoryManager>('inventory')
        .unwrap();

    }
  })
})

onUnmounted(() => {
  ecsApi.value?.cleanup();
});

function handleDrop(evt: DragEvent) {
  if (!evt.dataTransfer) return;
  const slot = evt.dataTransfer.getData('slot')
  inventoryManager?.dropBeltItem(Number(slot));
}
</script>

<template>
  <div class="game-renderer">
    <SettingsMenu v-if="store.showSettingsMenu" />
    <PauseMenu v-if="ecsApi" />
    <ItemBelt v-if="ecsApi" />
    <HealthHud v-if="ecsApi" />
    <canvas 
      ref="canvasEl" 
      droppable="true" 
      @drop="handleDrop($event)" 
      @dragenter.prevent 
      @dragover.prevent />
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
