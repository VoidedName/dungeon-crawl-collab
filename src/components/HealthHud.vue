<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import type { ECSEvent } from '@/events/createExternalQueue';

const ecsApi = useEcsApi();
const baseHealth = ref(0);
const currentHealth = ref(0);

ecsApi.value.on((event: any) => {
  if (event === 'ready') {
    const player = ecsApi.value.getEntities<[Player]>([PlayerBrand])[0]!;
    player.player.stats.current.health;
    currentHealth.value = player.player.stats.current.health;
    baseHealth.value = player.player.stats.base.health;

    ecsApi.value.on((event: ECSEvent) => {
      if (event === 'playerUpdate') {
        baseHealth.value = player.player.stats.base.health;
        currentHealth.value = player.player.stats.current.health;
      }
    });
  }
});

const health = computed(() => {
  return new Array(baseHealth.value).fill(false).map((value, index) => {
    return index + 1 <= currentHealth.value;
  });
});
</script>

<template>
  <ul class="health">
    <li
      :class="{
        heart: true,
        full: !!heart,
        empty: !heart
      }"
      v-for="(heart, index) in health"
    ></li>
  </ul>
</template>

<style scoped>
.health {
  display: flex;
  gap: var(--space-2);
}
.health > .heart {
  height: var(--space-8);
  width: var(--space-8);

  border: 2px solid var(--color-hp-dark);
  border-radius: 50%;
}

.health > .heart.full {
  background: linear-gradient(130deg, var(--color-hp), var(--color-hp-dark));
}

.health > .heart.empty {
  background-color: transparent;
}
</style>
