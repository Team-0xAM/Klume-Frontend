<template>
  <div class="chat-view">
    <SideBar
      :organization-name="organizationName"
      :user-name="userName"
      admin-menu-title="관리자메뉴"
    >
      <template #main-menu>
        <!-- 일반 메뉴 슬롯 -->
      </template>

      <template #admin-menu>
        <!-- 관리자 메뉴 슬롯 -->
      </template>

      <template #content>
        <div class="chat-container">
          <!-- 채팅방 헤더 -->
          <div class="chat-header">
            <div class="header-left">
              <h2 class="chat-title">민지 매니저</h2>  <!-- 테스트용 -->
              <div class="chat-info">
                <span class="participant-info">아로 · 192I</span>  <!-- 테스트용 -->
              </div>
            </div>

            <div class="header-actions">
              <div class="header-tabs">
                <button class="tab-button active">반별 톡</button>   <!-- 테스트용 -->
                <button class="tab-button">홈로드</button>   <!-- 테스트용 -->
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 로딩 상태 -->
          <div v-if="isConnecting || isLoadingHistory" class="status-message">
            <p>채팅 연결 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="errorMessage" class="status-message error">
            <p>{{ errorMessage }}</p>
            <button @click="reconnect" class="retry-button">다시 연결</button>
          </div>

          <!-- 채팅 메시지 영역 -->
          <div v-else class="chat-content">
            <ChatMessageList
              :messages="messages"
              :current-user-id="currentUserId"
            />

            <ChatInput
              @send="handleSendMessage"
              @sendWithImage="handleSendWithImage"
              :disabled="!isConnected"
            />
          </div>
        </div>
      </template>
    </SideBar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import SideBar from '../components/common/SideBar.vue'
import ChatMessageList from '../components/chat/ChatMessageList.vue'
import ChatInput from '../components/chat/ChatInput.vue'
import { useChat, uploadChatImage } from '../api/chat'

const route = useRoute()

// 라우트에서 organizationId와 roomId 가져오기
const organizationId = ref(parseInt(route.params.organizationId) || 1)
const roomId = ref(route.params.roomId || 'default-room')

// 현재 사용자 ID (localStorage에서 가져오기)
const currentUserId = ref(localStorage.getItem('email') || '')
const userName = ref(currentUserId.value)
const organizationName = ref('조직명') // 실제로는 API에서 가져와야 함

// useChat 컴포저블 사용
const {
  messages,
  isConnected,
  isConnecting,
  isLoadingHistory,
  errorMessage,
  connect,
  disconnect,
  sendMessage
} = useChat(organizationId.value, roomId.value)

// 메시지 전송 핸들러
const handleSendMessage = (content) => {
  const success = sendMessage(content)
  if (!success) {
    console.error('Failed to send message')
  }
}

// 이미지와 함께 메시지 전송
const handleSendWithImage = async ({ content, image }) => {
  if (!isConnected.value) {
    return
  }

  try {
    // 1. 이미지 업로드
    const response = await uploadChatImage(image)
    const imageUrl = response.data.imageUrl

    // 2. WebSocket으로 메시지 전송 (이미지 URL 포함)
    const success = sendMessage(content, imageUrl)
    if (!success) {
      throw new Error('메시지 전송 실패')
    }
  } catch (error) {
    console.error('Failed to send message with image:', error)
    errorMessage.value = '이미지 전송에 실패했습니다.'
  }
}

// 재연결 시도
const reconnect = () => {
  disconnect()
  setTimeout(() => {
    connect()
  }, 500)
}

// 컴포넌트 마운트 시 웹소켓 연결
onMounted(() => {
  connect()
})
</script>

<style scoped>
.chat-view {
  width: 100%;
  height: 100vh;
  background-color: #f8f9fb;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: #ffffff;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0c1c54;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.participant-info {
  font-size: 14px;
  color: #666;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-tabs {
  display: flex;
  gap: 8px;
}

.tab-button {
  padding: 8px 20px;
  border: none;
  background-color: transparent;
  color: #666;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.2s;
}

.tab-button.active {
  background-color: #0c1c54;
  color: white;
}

.tab-button:not(.active):hover {
  background-color: #f0f0f0;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
}

.status-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  text-align: center;
}

.status-message p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.status-message.error p {
  color: #d32f2f;
}

.retry-button {
  padding: 10px 24px;
  background-color: #0c1c54;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background-color: #0a1540;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
