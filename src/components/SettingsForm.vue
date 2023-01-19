<script lang="ts" setup>
import { getConfiguration, Controls } from '@/createControls.js';
import type { Control } from '@/createControls.js';

const configuration = ref<any>(getConfiguration());
const modifying = ref('');
const lastListener = ref();

const configurationMap = computed<Record<Control, string>>(() =>
  Object.fromEntries(
    Object.entries(configuration.value).map(([k, v]) => [v, k])
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
      <label :for="'move-' + control">{{ control }}</label>
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
  gap: var(--space-20);
  grid-template-columns: 8rem 1fr;
}

button:not([type='button']) {
  background: var(--color-primary-dark);
  color: var(--color-on-primary-dark);
  padding: var(--space-3);
  align-self: flex-start;
}
</style>
