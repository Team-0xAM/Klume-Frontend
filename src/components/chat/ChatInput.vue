<template>
  <div class="chat-input">
    <!-- 담당자가 아닐 때 안내 영역 -->
    <div v-if="disabled && disabledMessage" class="disabled-notice">
      <p class="notice-text">{{ disabledMessage }}</p>
      <slot name="action-button"></slot>
    </div>

    <!-- 일반 입력창 -->
    <div v-else class="input-wrapper">
      <!-- 이미지 미리보기 -->
      <div v-if="selectedImage" class="image-preview-container">
        <div class="image-preview">
          <img :src="imagePreviewUrl" alt="Preview" />
          <button @click="removeImage" class="remove-image-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div class="input-container">
        <!-- 이미지 업로드 버튼 -->
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept="image/*"
          style="display: none"
        />
        <button
          @click="openFileDialog"
          :disabled="disabled"
          class="attach-button"
          title="이미지 첨부"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

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
          :disabled="disabled || (!message.trim() && !selectedImage)"
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
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'

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

const emit = defineEmits(['send', 'sendWithImage'])

const message = ref('')
const textareaRef = ref(null)
const fileInput = ref(null)
const selectedImage = ref(null)
const imagePreviewUrl = ref('')

// 파일 선택 다이얼로그 열기
const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 파일 선택 처리
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

// 이미지 제거
const removeImage = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
  selectedImage.value = null
  imagePreviewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 메시지 전송
const handleSend = () => {
  if (props.disabled || (!message.value.trim() && !selectedImage.value)) {
    return
  }

  // 이미지가 있으면 이미지와 함께 전송
  if (selectedImage.value) {
    emit('sendWithImage', {
      content: message.value.trim(),
      image: selectedImage.value
    })
  } else {
    emit('send', message.value)
  }

  message.value = ''
  removeImage()

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

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-preview-container {
  padding: 8px;
}

.image-preview {
  position: relative;
  display: inline-block;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background-color: #f8f9fb;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  transition: border-color 0.2s;
}

.input-container:focus-within {
  border-color: #0c1c54;
}

.attach-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.attach-button:hover:not(:disabled) {
  background-color: #e0e0e0;
  color: #0c1c54;
}

.attach-button:disabled {
  color: #ccc;
  cursor: not-allowed;
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
