<template>
  <button
    class="gray-button"
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
  label: { type: String, default: '이전' },
  height: { type: Number, default: 48 },
  fontSize: { type: Number, default: 16 },
  depth: { type: String, default: 'normal' },
});
</script>

<style scoped>
.gray-button {
  width: 100%;
  border: none;
  border-radius: 10px;
  background-color: #f1f1f1;
  color: #222;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.gray-button:hover {
  background-color: #e5e5e5;
}
</style>
