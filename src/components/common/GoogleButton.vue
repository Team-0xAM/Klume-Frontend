<template>
  <button type="button" class="google-btn" @click.stop.prevent="handleClick">
    <img src="@/assets/icons/icon_google.png" alt="Google" class="google-icon" />
    <span>Google 계정으로 로그인</span>
  </button>
</template>

<script setup>
const emit = defineEmits(['click']);

const handleClick = (event) => {
  emit('click', event);
};
</script>

<style scoped>
.google-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
  color: #222;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.google-btn:hover {
  background-color: #f8f8f8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>
