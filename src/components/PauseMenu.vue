<script setup lang="ts">
import { Modal, ModalContent, ModalHeader } from './ui/Modal';

const isOpened = ref(false);

useEventListener('keyup', e => {
  if (e.code === 'Escape' && !isOpened.value) isOpened.value = true;
});
</script>

<template>
  <Modal v-model:is-opened="isOpened">
    <ModalContent>
      <button>Hello</button>
    </ModalContent>
  </Modal>
</template>
<style scoped></style>
