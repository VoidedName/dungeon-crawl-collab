<script lang="ts" setup>
const controls = ref<any>({
  right: 'KeyD',
  left: 'KeyA',
  up: 'KeyW',
  down: 'KeyS',
  use: 'KeyE'
});

const controlKeys = Object.keys(controls.value);

const modifying = ref('');
const lastListener = ref();

function submit() {
  // TODO: persist the form info into a shared global state that both the game and this form can modify?
}

function rebind(key: string, e: any) {
  e.currentTarget.blur();
  function onKeyPress(e: KeyboardEvent) {
    controls.value[key] = e.code;
    modifying.value = '';
    window.removeEventListener('keypress', onKeyPress);
  }
  if (lastListener.value) {
    window.removeEventListener('keypress', lastListener.value);
    lastListener.value = undefined;
  }
  lastListener.value = onKeyPress;
  modifying.value = key;
  window.addEventListener('keypress', onKeyPress);
}
</script>

<template>
  <form @submit.prevent="submit">
    <p v-for="control in controlKeys">
      <label :htmlFor="'move-' + control">Move Right</label>
      <button
        type="button"
        @click="rebind(control, $event)"
        maxLength="1"
        required
        :id="'move-' + control"
      >
        <span v-if="modifying === control">press any key to rebind</span>
        <span v-else>{{ controls[control] }}</span>
      </button>
    </p>

    <p>
      <button>Update</button>
    </p>
  </form>
</template>

<style scoped>
p {
  display: flex;
  gap: 10px;
}

label {
  width: 100px;
}

input {
  width: 40px;
}
</style>
