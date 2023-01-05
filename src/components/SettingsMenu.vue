<script setup lang="ts">
import { Modal, ModalContent } from './ui/Modal';
import SettingsForm from './SettingsForm.vue';

import { store } from '@/store';
</script>

<template>
  <Modal
    v-model:is-opened="store.showSettingsMenu"
    title="Settings Menu"
    :closable="true"
  >
    <ModalContent><SettingsForm /></ModalContent>
  </Modal>
</template>

<style scoped></style>
