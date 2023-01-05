<script lang="ts" setup>
import Gear from '~icons/mdi/gear';
import Container from './ui/Container.vue';

import { store } from '@/store';
</script>

<template>
  <header>
    <Container class="container">
      <router-link to="/">Dungeon Crawl</router-link>

      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/achievements">Achievements</router-link>
        <button @click="store.showSettingsMenu = true">
          <Gear />
          Settings
        </button>
        <router-link to="/about">About</router-link>
      </nav>
    </Container>
  </header>
</template>

<style scoped>
header {
  padding-block: var(--space-6);
  background: var(--color-surface);
  color: var(--color-on-surface);
  border-bottom: 1px solid #e5e7eb;
}

header > .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav {
  display: flex;
  gap: 30px;
}

nav > * {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
</style>
