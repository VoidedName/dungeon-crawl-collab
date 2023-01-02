<script setup lang="ts">
import { TransitionChild, DialogPanel } from '@headlessui/vue';
import { useModal } from '@/composables/useModal';
import { useSlotProps } from '@/composables/useSlotProps';
import Surface from '../Surface.vue';
import ModalHeader from './ModalHeader.vue';

const modal = useModal();
const { title } = modal;
const slotProps = useSlotProps(modal);
const slots = useSlots();
</script>

<template>
  <TransitionChild as="template" appear>
    <DialogPanel as="div" class="modal-content">
      <Surface class="inner">
        <slot name="header" v-bind="slotProps">
          <ModalHeader v-if="title" />
        </slot>

        <div class="body">
          <slot v-bind="slotProps" />
        </div>

        <footer v-if="slots.footer">
          <slot name="footer" v-bind="slotProps" />
        </footer>
      </Surface>
    </DialogPanel>
  </TransitionChild>
</template>

<style scoped lang="postcss">
.modal-content {
  --max-width: var(--breakpoints-md);
  width: 100%;
  max-width: var(--max-width);
  transition: all var(--duration-2);
  align-self: flex-start;
  overflow-y: auto;
  margin-block-start: var(--space-20);
}

.inner {
  max-height: 75%;
  display: flex;
  flex-direction: column;
}

.body {
  flex: 1;
}

footer {
  background-color: inherit;
  position: sticky;
  bottom: 0;
}
</style>
