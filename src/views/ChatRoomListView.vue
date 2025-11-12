<template>
  <div class="chat-room-list-view">
    <!-- 채팅방 목록 (왼쪽) -->
    <div class="chat-list-container">
      <div class="chat-list-header">
        <h2 class="page-title">{{ selectedRoom ? (selectedRoom.assignedToName || '미배정') : '채팅 문의' }}</h2>
        <div class="header-info" v-if="selectedRoom">
          <span class="participant-label">{{ selectedRoom.createdByEmail }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="filter-tabs">
        <button class="filter-tab active">내 담당 채팅</button>
        <button class="filter-tab">미배정 채팅</button>
      </div>

      <div class="search-bar">
        <input type="checkbox" id="unread-only" v-model="showOnlyMyChats" />
        <label for="unread-only">내 담당 채팅만 보기</label>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="status-message">
        <p>채팅방 목록을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="roomListErrorMessage" class="status-message error">
        <p>{{ roomListErrorMessage }}</p>
        <button @click="loadChatRooms" class="retry-button">다시 시도</button>
      </div>

      <!-- 채팅방 목록 -->
      <div v-else-if="filteredChatRooms.length > 0" class="chat-list-content">
        <ChatRoomListItem
          v-for="room in filteredChatRooms"
          :key="room.roomId"
          :chat-room="room"
          :show-assign-button="true"
          :current-user-email="currentUserEmail"
          :current-user-id="currentUserId"
          :class="{ selected: selectedRoomId === room.roomId }"
          @click="selectChatRoom(room)"
          @assign="handleAssign(room.roomId)"
          @unassign="handleUnassign(room.roomId)"
        />
      </div>

      <!-- 빈 상태 -->
      <div v-else class="status-message">
        <p>{{ showOnlyMyChats ? '담당한 문의가 없습니다.' : '등록된 문의가 없습니다.' }}</p>
      </div>
    </div>

    <!-- 채팅 화면 (오른쪽) -->
    <div class="chat-detail-container">
      <!-- 채팅방 선택 안됨 -->
      <div v-if="!selectedRoomId" class="empty-chat">
        <p>채팅방을 선택해주세요</p>
      </div>

      <!-- 채팅방 선택됨 -->
      <div v-else class="chat-area">
        <!-- 채팅방 헤더 -->
        <div class="chat-header">
          <div class="header-left">
            <h2 class="chat-title">{{ selectedRoom.assignedToName || '미배정' }}</h2>
            <div class="chat-info">
              <span class="participant-info">{{ selectedRoom.createdByEmail }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 로딩 상태 -->
        <div v-if="isConnecting" class="status-message">
          <p>채팅을 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="errorMessage" class="status-message error">
          <p>{{ errorMessage }}</p>
          <button @click="reconnect" class="retry-button">다시 연결</button>
        </div>

        <!-- 채팅 메시지 영역 -->
        <div v-else class="chat-content">
          <ChatMessageList :messages="messages || []" :current-user-id="currentUserEmail" />
          <ChatInput @send="handleSendMessage" :disabled="!isConnected" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ChatRoomListItem from '../components/chat/ChatRoomListItem.vue'
import ChatMessageList from '../components/chat/ChatMessageList.vue'
import ChatInput from '../components/chat/ChatInput.vue'
import { getChatRooms, assignChatRoom, unassignChatRoom, useChat } from '../api/chat'
import { fetchOrganizationInfo, organizationRole } from '@/composables/useOrganization.js'

const route = useRoute()

// 조직 ID (라우트에서 가져오기)
const organizationId = ref(parseInt(route.params.organizationId) || 1)

// 사용자 정보
const currentUserEmail = ref(localStorage.getItem('email') || '')
const currentUserId = ref(null) // OrganizationMember ID - 하드코딩(임시) API에서 가져와야 함
const isAdmin = computed(() => organizationRole.value === 'ADMIN') // 역할에서 관리자 여부 확인

// 채팅방 목록
const chatRooms = ref([])
const isLoading = ref(false)
const roomListErrorMessage = ref('')
const showOnlyMyChats = ref(false)

// 선택된 채팅방
const selectedRoomId = ref(null)
const selectedRoom = ref(null)

// 필터링된 채팅방 목록
const filteredChatRooms = computed(() => {
  if (!showOnlyMyChats.value) {
    return chatRooms.value
  }
  // assignedToId로 필터링 (OrganizationMember ID로 비교)
  return chatRooms.value.filter(room => room.assignedToId === currentUserId.value)
})

// 채팅 관련 상태
const messages = ref([])
const isConnected = ref(false)
const isConnecting = ref(false)
const errorMessage = ref('')
let chatInstance = null

// 채팅방 목록 로드
const loadChatRooms = async () => {
  isLoading.value = true
  roomListErrorMessage.value = ''

  try {
    const response = await getChatRooms(organizationId.value)
    chatRooms.value = response.data || []
  } catch (error) {
    console.error('Failed to load chat rooms:', error)
    roomListErrorMessage.value = '채팅방 목록을 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 채팅방 선택
const selectChatRoom = (room) => {
  console.log('=== 채팅방 선택 ===', room)
  selectedRoomId.value = room.roomId
  selectedRoom.value = room

  // 기존 채팅 연결 해제
  if (chatInstance) {
    chatInstance.disconnect()
  }

  // 새 채팅 연결 - isAdmin 파라미터 전달
  chatInstance = useChat(organizationId.value, room.roomId, isAdmin.value)

  // watch를 사용해서 chatInstance의 ref들을 동기화
  watch(() => chatInstance.messages.value, (newMessages) => {
    messages.value = newMessages
  }, { deep: true, immediate: true })

  watch(() => chatInstance.isConnected.value, (newValue) => {
    isConnected.value = newValue
  }, { immediate: true })

  watch(() => chatInstance.isConnecting.value, (newValue) => {
    isConnecting.value = newValue
  }, { immediate: true })

  watch(() => chatInstance.errorMessage.value, (newValue) => {
    errorMessage.value = newValue
  }, { immediate: true })

  console.log('=== 초기 메시지 ===', chatInstance.messages.value)

  // 웹소켓 연결
  chatInstance.connect()
}

// 메시지 전송
const handleSendMessage = (content) => {
  if (chatInstance) {
    chatInstance.sendMessage(content)
  }
}

// 재연결
const reconnect = () => {
  if (chatInstance) {
    chatInstance.disconnect()
    setTimeout(() => {
      chatInstance.connect()
    }, 500)
  }
}

// 담당하기
const handleAssign = async (roomId) => {
  try {
    await assignChatRoom(organizationId.value, roomId)
    await loadChatRooms()
  } catch (error) {
    console.error('Failed to assign chat room:', error)
    alert('담당 지정에 실패했습니다.')
  }
}

// 담당 해제
const handleUnassign = async (roomId) => {
  try {
    await unassignChatRoom(organizationId.value, roomId)
    await loadChatRooms()
  } catch (error) {
    console.error('Failed to unassign chat room:', error)
    alert('담당 해제에 실패했습니다.')
  }
}

// 컴포넌트 마운트 시 목록 로드
onMounted(() => {
  loadChatRooms()
})

// 컴포넌트 언마운트 시 WebSocket 연결 정리
onUnmounted(() => {
  if (chatInstance) {
    chatInstance.disconnect()
    chatInstance = null
  }
})
</script>

<style scoped>
.chat-room-list-view {
  display: flex;
  width: 100%;
  height: calc(100vh - 80px); /* OrganizationLayout의 padding 고려 */
  background-color: #f8f9fb;
}

/* 채팅방 목록 (왼쪽) */
.chat-list-container {
  width: 400px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
}

.chat-list-header {
  padding: 20px;
  background-color: #ffffff;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #0c1c54;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.participant-label {
  font-size: 14px;
  color: #666;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 20px 8px 20px;
}

.filter-tab {
  padding: 6px 16px;
  border: none;
  background-color: transparent;
  color: #666;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.2s;
}

.filter-tab.active {
  background-color: #0c1c54;
  color: white;
}

.filter-tab:not(.active):hover {
  background-color: #f0f0f0;
}

.search-bar {
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-bar input[type='checkbox'] {
  cursor: pointer;
}

.search-bar label {
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.chat-list-content {
  flex: 1;
  overflow-y: auto;
}

.chat-list-content :deep(.chat-room-item.selected) {
  background-color: #f0f4ff;
  border-left: 3px solid #0c1c54;
}

/* 채팅 화면 (오른쪽) */
.chat-detail-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-chat p {
  font-size: 16px;
  color: #999;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
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

/* 스크롤바 스타일링 */
.chat-list-content::-webkit-scrollbar {
  width: 8px;
}

.chat-list-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.chat-list-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.chat-list-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
