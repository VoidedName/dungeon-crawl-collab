<script lang="ts" setup>
import { getConfiguration, Controls } from '@/ControlsManager';
import type { ComputedRef } from 'vue';
import type { Control } from '@/ControlsManager';

const configuration = ref<any>(getConfiguration());
const modifying = ref('');
const lastListener = ref();

const configurationMap: ComputedRef<Record<Control, string>> = computed(() =>
  Object.entries(configuration.value).reduce(
    (obj, [key, value]: any) => ({ ...obj, [value]: key }),
    {} as any
  )
);

function rebind(control: Control, e: any) {
  e.currentTarget.blur();
  function onKeyPress(e: KeyboardEvent) {
    const oldKeyCode = configurationMap.value[control];
    delete configuration.value[oldKeyCode];
    configuration.value[e.code] = control;
    modifying.value = '';
    window.removeEventListener('keypress', onKeyPress);
  }
  if (lastListener.value) {
    window.removeEventListener('keypress', lastListener.value);
    lastListener.value = undefined;
  }
  lastListener.value = onKeyPress;
  modifying.value = control;
  window.addEventListener('keypress', onKeyPress);
}
</script>

<template>
  <section>
    <fieldset v-for="control in Controls">
      <label :for="'move-' + control">Move {{ control }}</label>
      <button
        type="button"
        @click="rebind(control, $event)"
        maxLength="1"
        required
        :id="'move-' + control"
      >
        <span v-if="modifying === control">Press any key to rebind</span>
        <span v-else>{{ configurationMap[control] }}</span>
      </button>
    </fieldset>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

fieldset {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: 8rem 1fr;
}

button:not([type='button']) {
  background: var(--color-primary-dark);
  color: var(--color-on-primary-dark);
  padding: var(--space-3);
  align-self: flex-start;
}
</style>
