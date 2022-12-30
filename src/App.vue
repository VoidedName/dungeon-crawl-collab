<script lang="ts" setup>
import Header from './components/Header.vue';
</script>

<template>
  <div class="layout">
    <Header />
    <main><router-view /></main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
