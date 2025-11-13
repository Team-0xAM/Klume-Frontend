<template>
  <div class="chat-message-list" ref="messageContainer">
    <div v-if="messages.length === 0" class="empty-messages">
      <p>메시지가 없습니다.</p>
    </div>

    <div v-else class="messages">
      <div
        v-for="(message, index) in messages"
        :key="message.id || index"
        :class="['message-wrapper', { 'my-message': isMyMessage(message), 'system-message': isSystemMessage(message) }]"
      >
        <!-- 시스템 메시지 (공지 스타일) -->
        <div v-if="isSystemMessage(message)" class="system-notification">
          <span class="system-text">{{ message.content }}</span>
          <span class="system-time">{{ formatTime(message.createdAt) }}</span>
        </div>

        <!-- 일반 메시지 -->
        <div v-else class="message-bubble">
          <div class="message-header">
            <span class="sender-name">{{ message.senderName || message.senderId }}</span>
            <span v-if="message.admin" class="admin-badge">관리자</span>
          </div>
          <!-- 이미지가 있으면 표시 -->
          <div v-if="message.imageUrl" class="message-image">
            <img :src="message.imageUrl" :alt="message.content || '이미지'" @click="openImageModal(message.imageUrl)" />
          </div>
          <div v-if="message.content" class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

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
const isUserScrolling = ref(false)

// 내 메시지인지 확인
const isMyMessage = (message) => {
  return message.senderId === props.currentUserId
}

// 시스템 메시지인지 확인 (senderId가 "SYSTEM"이거나 없는 경우)
const isSystemMessage = (message) => {
  return message.senderId === 'SYSTEM' || message.isSystemMessage === true
}

// 이미지 모달 열기 (새 창으로)
const openImageModal = (imageUrl) => {
  window.open(imageUrl, '_blank')
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

// 사용자가 맨 아래에 있는지 확인
const isAtBottom = () => {
  if (!messageContainer.value) return false
  const threshold = 50 // 50px 이내면 맨 아래로 간주
  const { scrollTop, scrollHeight, clientHeight } = messageContainer.value
  //console.log('[isAtBottom] scrollTop:', scrollTop, 'scrollHeight:', scrollHeight, 'clientHeight:', clientHeight, 'distance from bottom:', scrollHeight - scrollTop - clientHeight)
  return scrollHeight - scrollTop - clientHeight < threshold
}

// 스크롤을 맨 아래로 이동하는 함수
const scrollToBottom = () => {
  nextTick(() => {
        // if (messageContainer.value && !isUserScrolling.value) {
    const el = messageContainer.value
    if (!el) return
    console.log('[scrollToBottom] Before - scrollTop:', el.scrollTop, 'scrollHeight:', el.scrollHeight, 'clientHeight:', el.clientHeight)
    el.scrollTop = el.scrollHeight
    console.log('[scrollToBottom] After - scrollTop:', el.scrollTop)
        // }
  })
}

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  if (!messageContainer.value) return

  // 사용자가 맨 아래에 있으면 자동 스크롤 활성화
  if (isAtBottom()) {
    isUserScrolling.value = false
  } else {
    // 위로 스크롤했으면 자동 스크롤 비활성화
    isUserScrolling.value = true
  }
}

// 메시지 개수가 변경되면 스크롤 (맨 아래에 있을 때만)
watch(
  () => props.messages.length,
  () => {
    if (!isUserScrolling.value || isAtBottom()) {
      scrollToBottom()
    }
  }
)

// 컴포넌트 마운트 시 스크롤 및 이벤트 리스너 등록
onMounted(() => {
  if (messageContainer.value) {
    messageContainer.value.addEventListener('scroll', handleScroll)
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }
})
</script>

<style scoped>
.chat-message-list {
  /* flex: 1; */
  height: 650px;       /* 임시 고정 높이 */
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

.message-wrapper:not(.my-message):not(.system-message) {
  justify-content: flex-start;
}

.message-wrapper.my-message {
  justify-content: flex-end;
}

.message-wrapper.system-message {
  justify-content: center;
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

.message-image {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px;
  cursor: pointer;
}

.message-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: opacity 0.2s;
}

.message-image img:hover {
  opacity: 0.9;
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

/* 시스템 공지 메시지 스타일 */
.system-notification {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background-color: rgba(12, 28, 84, 0.05);
  border: 1px dotted rgba(12, 28, 84, 0.2);
  border-radius: 8px;
  max-width: 80%;
}

.system-text {
  font-size: 13px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.system-time {
  font-size: 11px;
  color: #999;
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
