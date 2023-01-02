<script setup lang="ts">
import { DialogTitle } from '@headlessui/vue';
import { useModal } from '@/composables/useModal';
import { useSlotProps } from '@/composables/useSlotProps';
import IconClose from '~icons/mdi/close';

const modal = useModal();
const { title, closable, close } = modal;
const slotProps = useSlotProps(modal);
</script>

<template>
  <DialogTitle as="template">
    <header class="modal-header">
      <slot v-bind="slotProps">
        <h2>{{ title }}</h2>

        <button v-if="closable" title="close" @click="close">
          <IconClose />
        </button>
      </slot>
    </header>
  </DialogTitle>
</template>

<style scoped lang="postcss">
.modal-header {
  padding-block: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
}

.modal-header > h2 {
  font-size: var(--text-size-5);
}
</style>
