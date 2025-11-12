<template>
  <div class="member-chat-view">
    <!-- 로딩 상태 -->
    <div v-if="isInitializing" class="status-message">
      <p>채팅을 준비하는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="errorMessage" class="status-message error">
      <p>{{ errorMessage }}</p>
      <button @click="initializeChat" class="retry-button">다시 시도</button>
    </div>

    <!-- 채팅 화면 -->
    <div v-else class="chat-container">
      <!-- 채팅 헤더 -->
      <div class="chat-header">
        <div class="org-info">
          <div class="org-avatar">
            <img v-if="organization.imageUrl" :src="organization.imageUrl" :alt="organization.name" />
            <span v-else class="org-initial">{{ getInitial(organization.name) }}</span>
          </div>
          <div>
            <h3 class="org-name">{{ organization.name }}</h3>
            <p class="org-subtitle">{{ chatRoom?.assignedToName || '담당자 배정 대기 중' }}</p>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 메시지 영역 -->
      <div class="messages-container">
        <ChatMessageList :messages="messages" :current-user-id="currentUserEmail" />
      </div>

      <!-- 입력 영역 -->
      <div class="input-container">
        <ChatInput @send="handleSendMessage" :disabled="!isConnected || isSending" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatInput from './ChatInput.vue'
import { getOrCreateMyChatRoom, getMyChatMessages, useChat } from '@/api/chat'
import { getUserEmail } from '@/utils/auth'

const props = defineProps({
  organization: {
    type: Object,
    required: true
    // { organizationId, organizationName, ... }
  }
})

const currentUserEmail = ref(getUserEmail() || '')

// 상태
const chatRoom = ref(null) // { roomId, organizationId, createdById, assignedToId, ... }
const isInitializing = ref(false)
const errorMessage = ref('')
const isSending = ref(false)

// 채팅 인스턴스
let chatInstance = null
let messages = ref([])
let isConnected = ref(false)

// 조직명 이니셜
const getInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// 채팅 초기화 (채팅방 조회 또는 생성)
const initializeChat = async () => {
  isInitializing.value = true
  errorMessage.value = ''

  try {
    // 1. 채팅방 조회/생성 API 호출
    // TODO: 이미 채팅방이 있는 경우 content가 필요 없도록 백엔드 수정 필요
    // 현재는 임시 메시지를 보내지만, 채팅방이 이미 있으면 메시지가 생성되지 않음 (백엔드에서 처리)
    const response = await getOrCreateMyChatRoom(props.organization.organizationId, '안녕하세요, 문의 드립니다.')
    chatRoom.value = response.data

    // 2. 메시지 히스토리 로드
    const historyResponse = await getMyChatMessages(chatRoom.value.roomId)

    // 3. WebSocket 연결
    chatInstance = useChat(props.organization.organizationId, chatRoom.value.roomId, false) // isAdmin = false

    // 메시지 히스토리를 chatInstance에 설정
    chatInstance.messages.value = historyResponse.data || []

    // chatInstance의 ref를 직접 참조 (반응성 유지)
    messages = chatInstance.messages
    isConnected = chatInstance.isConnected

    // WebSocket 연결 시작
    await chatInstance.connect()
  } catch (error) {
    console.error('Failed to initialize chat:', error)
    errorMessage.value = '채팅을 시작할 수 없습니다.'
  } finally {
    isInitializing.value = false
  }
}

// 메시지 전송
const handleSendMessage = async (content) => {
  if (!chatInstance || !isConnected.value || isSending.value) {
    return
  }

  isSending.value = true
  try {
    const success = chatInstance.sendMessage(content)
    if (!success) {
      throw new Error('메시지 전송 실패')
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    errorMessage.value = '메시지 전송에 실패했습니다.'
  } finally {
    isSending.value = false
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  initializeChat()
})

// 외부에서 접근 가능하도록 expose
defineExpose({
  chatRoom,
  initializeChat
})
</script>

<style scoped>
.member-chat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.status-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 24px;
  text-align: center;
}

.status-message p {
  margin: 0;
  font-size: 15px;
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

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px 24px;
  background-color: #ffffff;
}

.org-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.org-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #e8eaf6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.org-initial {
  font-size: 18px;
  font-weight: 700;
  color: #0c1c54;
}

.org-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0c1c54;
}

.org-subtitle {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.input-container {
  flex-shrink: 0;
}
</style>
