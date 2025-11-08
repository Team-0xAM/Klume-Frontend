<template>
  <button
    class="base-yellow-btn"
    :style="{ height: `${height}px`, fontSize: `${fontSize}px` }"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: String,
  height: {
    type: Number,
    default: 50,
  },
  fontSize: {
    type: Number,
    default: 18,
  },
});
</script>

<style scoped>
.base-yellow-btn {
  width: 100%;
  background-color: #f5cf41;
  color: #0c1c54;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;
  font-family: 'Noto Sans KR', sans-serif;
}

.base-yellow-btn:hover {
  background-color: #e4bb35;
  transform: scale(1.02);
}

.base-yellow-btn:active {
  background-color: #d1a92d;
  transform: scale(0.98);
}
</style>
