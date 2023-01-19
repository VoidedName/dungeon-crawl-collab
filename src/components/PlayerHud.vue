<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import Surface from './ui/Surface.vue';
import { type Player, PlayerBrand } from '@/entity/components/Player';
import type { ECSEvent } from '@/events/createExternalQueue';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import type { ECSEntity } from '@/ecs/ECSEntity';

const ecsApi = useEcsApi();

const player = ref<ECSEntity & Player & Animatable>();

const expBarWidth = computed(() => {
  if (!player.value) return 0;
  const { current } = player.value.player.stats;

  const percentage = (current.experience * 100) / current.experienceToNextLevel;

  return `${percentage}%`;
});

ecsApi.value.on((event: ECSEvent) => {
  if (['ready', 'playerUpdate'].includes(event)) {
    player.value = {
      ...ecsApi.value.getEntities<[Player, Animatable]>([
        PlayerBrand,
        AnimatableBrand
      ])[0]!
    };
  }
});
</script>

<template>
  <Surface class="player-hud">
    <h2>{{ player?.animatable.spriteName }}</h2>
    <div>Lvl {{ player?.player.stats.current.level }}</div>
    <div>
      Exp {{ player?.player.stats.current.experience }} /
      {{ player?.player.stats.current.experienceToNextLevel }}
    </div>
    <div class="exp-bar" />
  </Surface>
</template>

<style scoped>
.player-hud {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 12rem;
}

.player-hud h2 {
  text-transform: capitalize;
}

.exp-bar {
  height: var(--space-5);
  border: solid 1px var(--color-primary-light);
  position: relative;
}

.exp-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: var(--color-primary-light);
  width: v-bind(expBarWidth);
  transition: width var(--transition-md) ease-out;
}
</style>
