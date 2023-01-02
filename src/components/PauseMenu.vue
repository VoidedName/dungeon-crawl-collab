<script setup lang="ts">
import { useEcsApi } from '@/composables/useEcsApi';
import { Modal, ModalContent } from './ui/Modal';

const isOpened = ref(false);
useEventListener('keyup', e => {
  if (e.code === 'Escape') isOpened.value = !isOpened.value;
});

const ecsApi = useEcsApi();
</script>

<template>
  <Modal v-model:is-opened="isOpened" title="Game Menu" :closable="false">
    <ModalContent>This is the pause menu</ModalContent>
  </Modal>
</template>

<style scoped></style>
