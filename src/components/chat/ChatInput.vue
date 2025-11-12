<template>
  <div class="chat-input">
    <!-- 담당자가 아닐 때 안내 영역 -->
    <div v-if="disabled && disabledMessage" class="disabled-notice">
      <p class="notice-text">{{ disabledMessage }}</p>
      <slot name="action-button"></slot>
    </div>

    <!-- 일반 입력창 -->
    <div v-else class="input-container">
      <textarea
        v-model="message"
        @keydown.enter.exact.prevent="handleSend"
        @keydown.enter.shift.exact="handleNewLine"
        :disabled="disabled"
        :placeholder="disabled ? '연결 중...' : '메시지를 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)'"
        class="message-input"
        rows="1"
        ref="textareaRef"
      />
      <button
        @click="handleSend"
        :disabled="disabled || !message.trim()"
        class="send-button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  disabledMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['send'])

const message = ref('')
const textareaRef = ref(null)

// 메시지 전송
const handleSend = () => {
  if (props.disabled || !message.value.trim()) {
    return
  }

  emit('send', message.value)
  message.value = ''

  // textarea 높이 초기화
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

// Shift+Enter로 줄바꿈
const handleNewLine = (event) => {
  // 기본 동작 허용 (줄바꿈)
}

// textarea 자동 높이 조절
watch(message, () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
    }
  })
})
</script>

<style scoped>
.chat-input {
  padding: 16px 20px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.disabled-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  gap: 16px;
}

.notice-text {
  margin: 0;
  font-size: 14px;
  color: #856404;
  font-weight: 500;
  flex: 1;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background-color: #f8f9fb;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  transition: border-color 0.2s;
}

.input-container:focus-within {
  border-color: #0c1c54;
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: #333;
  resize: none;
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.5;
}

.message-input::placeholder {
  color: #999;
}

.message-input:disabled {
  color: #999;
  cursor: not-allowed;
}

.send-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background-color: #0c1c54;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: #15266b;
  transform: scale(1.05);
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 스크롤바 스타일링 */
.message-input::-webkit-scrollbar {
  width: 6px;
}

.message-input::-webkit-scrollbar-track {
  background: transparent;
}

.message-input::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.message-input::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
