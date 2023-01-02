<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog } from '@headlessui/vue';
import { useModalProvider } from '@/composables/useModal';
import type { Nullable } from '@/utils/types';

type Props = {
  isOpened: boolean;
  closable?: boolean;
  title?: Nullable<string>;
};
const props = withDefaults(defineProps<Props>(), {
  closable: true,
  title: undefined
});
const emit = defineEmits<{ (e: 'update:isOpened', val: boolean): void }>();
const vModel = useVModel(props, 'isOpened', emit);
const containerEl = ref<HTMLElement>();

useModalProvider({
  isOpened: vModel,
  closable: toRef(props, 'closable'),
  title: toRef(props, 'title')
});
</script>

<template>
  <TransitionRoot appear :show="vModel" as="template">
    <Dialog
      as="div"
      class="modal"
      relative
      :static="!closable"
      @close="vModel = false"
    >
      <div
        ref="containerEl"
        fixed
        inset-0
        overflow-y-auto
        grid
        justify-items-center
        un-children="col-start-1 row-start-1"
      >
        <TransitionChild appear as="template">
          <div class="backdrop" />
        </TransitionChild>
        <slot />
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped lang="postcss">
.modal {
  position: relative;
  z-index: 10;

  & > div {
    position: fixed;
    inset: 0;
    overflow-y: auto;
    display: grid;
    justify-items: center;

    > * {
      grid-column: 1;
      grid-row: 1;
    }
  }
}

.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
