<script setup lang="ts">
import { useEcsApiProvider } from '@/composables/useEcsApi';
import { createGameLoop } from '@/createGameLoop';
import { createGameRenderer } from '@/renderer/createGameRenderer.js';
import PauseMenu from './PauseMenu.vue';
import SettingsMenu from './SettingsMenu.vue';
import ItemBelt from './ItemBelt.vue';
import HealthHud from './HealthHud.vue';
import PlayerHud from './PlayerHud.vue';
import { store } from '@/store';
import type { TInventoryManager } from '@/createInventoryManager';
import type { ECSEvent } from '@/events/createExternalQueue';

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
  });
});

onUnmounted(() => {
  ecsApi.value?.cleanup();
});

function handleDrop(evt: DragEvent) {
  if (!evt.dataTransfer) return;
  const slot = evt.dataTransfer.getData('slot');
  inventoryManager?.dropBeltItem(Number(slot));
}
</script>

<template>
  <div class="game-renderer">
    <SettingsMenu v-if="store.showSettingsMenu" />

    <template v-if="ecsApi">
      <PauseMenu />
      <ItemBelt class="item-belt" />
      <PlayerHud class="player-hud" />
      <HealthHud class="health-hud" />
    </template>

    <canvas
      ref="canvasEl"
      droppable="true"
      @drop="handleDrop($event)"
      @dragenter.prevent
      @dragover.prevent
    />
  </div>
</template>

<style scoped>
.game-renderer {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
}
canvas {
  display: block;
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}

.player-hud,
.item-belt,
.health-hud {
  position: relative;
  z-index: 1;
}
.player-hud {
  grid-column: 1;
  grid-row: 1;
  align-self: flex-start;
  justify-self: start;
}

.item-belt {
  grid-column: 2;
  grid-row: 3;
  align-self: flex-end;
}

.health-hud {
  grid-column: 1;
  grid-row: 3;
  align-self: flex-end;
  padding: var(--space-6);
}
</style>
