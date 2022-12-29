<script setup lang="ts">
const counter = ref(0);
</script>

<template>
  <h1>The Home Page</h1>
  <button @click="counter++">{{ counter }}</button>
</template>
