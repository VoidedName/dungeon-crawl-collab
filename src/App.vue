<script lang="ts" setup>
import Header from './components/Header.vue';
</script>

<template>
  <Header />
  <main><router-view /></main>
  <footer>The Footer</footer>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Inconsolata|Oswald');

body,
html {
  margin: 0;
  font-family: 'Inconsolata', sans-serif;
}

.page-container {
  max-width: 920px;
  margin: 0 auto;
}
</style>
