<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import Surface from './ui/Surface.vue';
import { type Player, PlayerBrand } from '@/entity/components/Player';
import type { ECSEvent } from '@/events/createExternalQueue';
import type { ECSEntity } from '@/ecs/ECSEntity';

const ecsApi = useEcsApi();

const player = ref<ECSEntity & Player>();
const isDisplayed = ref(false);

ecsApi.value.on((event: ECSEvent) => {
  if (['ready', 'playerUpdate'].includes(event)) {
    player.value = {
      ...ecsApi.value.getEntities<[Player]>([PlayerBrand])[0]!
    };
  }
});

watch(
  () => player.value?.player.stats.current.level,
  (newLevel, oldLevel) => {
    if (!isDefined(oldLevel) || newLevel === oldLevel) return;

    isDisplayed.value = true;
    setTimeout(() => {
      isDisplayed.value = false;
    }, 2000);
  }
);
</script>

<template>
  <transition>
    <div class="level-up-alert" v-if="isDisplayed">
      <h2>LEVEL UP</h2>
      <p>
        {{ player?.player.playerClass.className }} Level
        {{ player?.player.stats.current.level }}
      </p>
    </div>
  </transition>
</template>

<style scoped>
.level-up-alert {
  position: fixed;
  inset: 0;
  text-align: center;
  padding-top: 20vh;
  pointer-events: none;
}

.level-up-alert::after,
.level-up-alert::before {
  transition: transform var(--transition-md);
}

.level-up-alert::before {
  content: '';
  position: absolute;
  top: calc(20vh - 0.25rem);
  left: 0;
  width: 50%;
  height: 2px;
  background-color: var(--color-primary-light);
}
.level-up-alert::after {
  content: '';
  position: absolute;
  top: calc(20vh + var(--text-size-7) + var(--text-size-5) + 1rem);
  right: 0;
  width: 50%;
  height: 2px;
  background-color: var(--color-primary-light);
}

.level-up-alert > * {
  transition: transform var(--transition-md);
}
.level-up-alert > h2 {
  font-size: var(--text-size-7);
}
.level-up-alert > p {
  font-size: var(--text-size-5);
}

.v-enter-active,
.v-leave-active {
  transition: opacity var(--transition-md) ease-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.v-enter-from > *,
.v-leave-to > * {
  transform: translateY(-1rem);
}
.v-enter-from::before,
.v-enter-from::after {
  transform: scaleX(0);
}
</style>
