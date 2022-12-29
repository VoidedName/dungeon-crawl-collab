<script lang="ts" setup>
import Gear from '~icons/mdi/gear';
</script>

<template>
  <header>
    <div class="container">
      <a>Dungeon Crawl</a>

      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/achievements">Achievements</router-link>
        <router-link to="/settings">
          <Gear />
          Settings
        </router-link>
        <router-link to="/about">About</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
header {
  height: 50px;
  background: white;
  color: black;
  border-bottom: 1px solid #e5e7eb;
}

.container {
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  position: relative;
  min-width: 1px;
  max-width: 920px;
  margin: 0 auto;
  justify-content: space-between;
  align-items: center;
}

nav {
  display: flex;
  gap: 30px;
}

a {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
