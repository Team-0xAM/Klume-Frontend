<template>
  <div class="chat-message-list" ref="messageContainer">
    <div v-if="messages.length === 0" class="empty-messages">
      <p>메시지가 없습니다.</p>
    </div>

    <div v-else class="messages">
      <div
        v-for="(message, index) in messages"
        :key="message.id || index"
        :class="['message-wrapper', { 'my-message': isMyMessage(message) }]"
      >
        <div class="message-bubble">
          <div class="message-header">
            <span class="sender-name">{{ message.senderId }}</span>
            <span v-if="message.admin" class="admin-badge">관리자</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUpdated } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true,
    default: () => []
  },
  currentUserId: {
    type: String,
    required: true
  }
})

const messageContainer = ref(null)

// 내 메시지인지 확인
const isMyMessage = (message) => {
  console.log('=== isMyMessage 체크 ===')
  console.log('message.senderId:', message.senderId)
  console.log('props.currentUserId:', props.currentUserId)
  console.log('일치 여부:', message.senderId === props.currentUserId)
  return message.senderId === props.currentUserId
}

// 시간 포맷팅
const formatTime = (timestamp) => {
  if (!timestamp) return ''

  try {
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? '오후' : '오전'
    const displayHours = hours % 12 || 12

    return `${ampm} ${displayHours}:${minutes}`
  } catch (error) {
    return ''
  }
}

// 스크롤을 맨 아래로 이동하는 함수
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      console.log('스크롤 전 scrollTop:', messageContainer.value.scrollTop)
      console.log('scrollHeight:', messageContainer.value.scrollHeight)
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      console.log('스크롤 후 scrollTop:', messageContainer.value.scrollTop)
    } else {
      console.log('messageContainer가 없습니다')
    }
  })
}

// 메시지가 추가되면 스크롤을 아래로
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true, immediate: true }
)

// 컴포넌트 마운트 및 업데이트 시 스크롤
onMounted(() => {
  scrollToBottom()
})

onUpdated(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fb;
}

.empty-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-messages p {
  color: #999;
  font-size: 14px;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  animation: fadeIn 0.3s ease-in;
  width: 100%;
}

.message-wrapper:not(.my-message) {
  justify-content: flex-start;
}

.message-wrapper.my-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  display: inline-block;
}

/* 상대방 메시지 (왼쪽) - 회색 배경 */
.message-wrapper:not(.my-message) .message-bubble {
  background-color: #f0f0f0;
  border-top-left-radius: 4px;
}

/* 내 메시지 (오른쪽) - 노란색 배경 */
.message-wrapper.my-message .message-bubble {
  background-color: #ffe812;
  color: #000;
  border-top-right-radius: 4px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sender-name {
  font-size: 13px;
  font-weight: 700;
  color: #666;
}

.my-message .sender-name {
  color: #222;
}

.admin-badge {
  font-size: 10px;
  padding: 2px 6px;
  background-color: #f5c843;
  color: #0c1c54;
  border-radius: 4px;
  font-weight: 700;
}

.my-message .admin-badge {
  background-color: #ffa500;
  color: white;
}

.message-content {
  font-size: 15px;
  line-height: 1.6;
  color: #222;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.my-message .message-content {
  color: #000;
}

.message-time {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.message-wrapper:not(.my-message) .message-time {
  text-align: left;
}

.my-message .message-time {
  text-align: right;
  color: #666;
}

/* 스크롤바 스타일링 */
.chat-message-list::-webkit-scrollbar {
  width: 8px;
}

.chat-message-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.chat-message-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.chat-message-list::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
