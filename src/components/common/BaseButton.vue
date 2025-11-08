<template>
  <button
    class="base-button"
    :style="{
      height: height + 'px',
      fontWeight: depth === 'bold' ? 600 : 500,
      fontSize: fontSize + 'px',
    }"
    @click="$emit('click')"
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
