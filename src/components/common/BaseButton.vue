<template>
  <button
    type="button"
    class="base-button"
    :style="{
      height: height + 'px',
      fontWeight: depth === 'bold' ? 600 : 500,
      fontSize: fontSize + 'px',
    }"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, default: '버튼' },
  height: { type: Number, default: 48 },
  fontSize: { type: Number, default: 16 },
  depth: { type: String, default: 'normal' }, // normal | bold
});

const emit = defineEmits(['click']);

const handleClick = (event) => {
  emit('click', event);
};
</script>

<style scoped>
.base-button {
  width: 100%;
  border: none;
  border-radius: 10px;
  background-color: #0c1c54;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.base-button:hover {
  background-color: #15266b;
}
</style>
