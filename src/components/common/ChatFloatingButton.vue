<template>
  <button class="chat-floating-button" @click="$emit('click')" :class="{ 'has-badge': unreadCount > 0 }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span v-if="unreadCount > 0" class="badge">{{ displayCount }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  unreadCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['click'])

const displayCount = computed(() => {
  return props.unreadCount > 99 ? '99+' : props.unreadCount
})
</script>

<style scoped>
.chat-floating-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #F5D042;
  color: #0c1c54;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(12, 28, 84, 0.3);
  transition: all 0.3s ease;
  z-index: 999;
}

.chat-floating-button:hover {
  background-color: #0a1540;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(12, 28, 84, 0.4);
}

.chat-floating-button:active {
  transform: scale(0.95);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: #ff3b30;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chat-floating-button.has-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(12, 28, 84, 0.3);
  }
  50% {
    box-shadow: 0 4px 12px rgba(12, 28, 84, 0.3), 0 0 0 8px rgba(12, 28, 84, 0.1);
  }
}
</style>
