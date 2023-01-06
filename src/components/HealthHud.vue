<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import type { ECSEvent } from '@/createGameLoop';

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
      if (event === 'playerHealthChanged') {
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
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 5px;
}
.health > .heart {
  height: 25px;
  width: 25px;
  border: 1px solid red;
  border-radius: 50%;
  background: pink;
}

.health > .heart.full {
  background: pink;
}

.health > .heart.empty {
  background: gray;
}
</style>
