import api from './axios'
import { ref, onUnmounted } from 'vue'
import { createChatSocket, sendMessage as publishMessage } from './chat/chatSocket'

// ==================== REST API ====================

/**
 * 내 정보 조회 (조직 목록 포함)
 * @returns {Promise} 사용자 정보 및 조직 목록
 */
export const getUserInfo = () => {
  return api.get('/members/me')
}

/**
 * 채팅방 목록 조회 (관리자용)
 * @param {number} organizationId - 조직 ID
 * @returns {Promise} 채팅방 목록
 */
export const getChatRooms = (organizationId) => {
  return api.get(`/organizations/${organizationId}/chat-rooms`)
}

/**
 * 내 채팅방 조회 또는 생성 (일반 회원용)
 * @param {number} organizationId - 조직 ID
 * @param {string} content - 첫 메시지 내용
 * @returns {Promise} 채팅방 정보
 */
export const getOrCreateMyChatRoom = (organizationId, content) => {
  return api.post(`/my-chats/organizations/${organizationId}`, { content })
}

/**
 * 내 채팅 메시지 조회 (일반 회원용)
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise} 채팅 메시지 목록
 */
export const getMyChatMessages = (roomId) => {
  return api.get(`/my-chats/${roomId}/messages`)
}

/**
 * 채팅방 생성 (일반 회원용) - DEPRECATED: getOrCreateMyChatRoom 사용 권장
 * @param {number} organizationId - 조직 ID
 * @param {object} data - 채팅방 생성 데이터
 * @returns {Promise} 생성된 채팅방 정보
 */
export const createChatRoom = (organizationId, data) => {
  return api.post(`/organizations/${organizationId}/chat-rooms`, data)
}

/**
 * 채팅방 담당하기 (관리자용)
 * @param {number} organizationId - 조직 ID
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise}
 */
export const assignChatRoom = (organizationId, roomId) => {
  return api.post(`/organizations/${organizationId}/chat-rooms/${roomId}/assign`)
}

/**
 * 채팅방 담당 해제 (관리자용)
 * @param {number} organizationId - 조직 ID
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise}
 */
export const unassignChatRoom = (organizationId, roomId) => {
  return api.delete(`/organizations/${organizationId}/chat-rooms/${roomId}/assign`)
}

/**
 * 채팅 히스토리 조회
 * @param {number} organizationId - 조직 ID
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise} 채팅 메시지 목록
 */
export const getChatHistory = (organizationId, roomId) => {
  return api.get(`/organizations/${organizationId}/chat-rooms/${roomId}/messages`)
}

/**
 * 채팅 이미지 업로드
 * @param {File} imageFile - 업로드할 이미지 파일
 * @returns {Promise} 이미지 URL
 */
export const uploadChatImage = (imageFile) => {
  const formData = new FormData()
  formData.append('image', imageFile)

  return api.post('/my-chats/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ==================== WebSocket Composable 파트  ====================

/**
 * 채팅 웹소켓 연결 및 메시지 관리 Composable
 * @param {number} organizationId - 조직 ID
 * @param {number} roomId - 채팅방 ID
 * @param {boolean} isAdmin - 관리자 여부 (필수)
 * @returns {object} 채팅 상태 및 메서드
 */
export const useChat = (organizationId, roomId, isAdmin) => {
  const messages = ref([])
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const isLoadingHistory = ref(false)
  const errorMessage = ref('')
  let client = null

  // 관리자 여부 확인
  if (isAdmin === undefined) {
    console.error('isAdmin parameter is required')
  }

  // 채팅 히스토리 로드
  const loadChatHistory = async () => {
    if (!organizationId || !roomId) {
      return
    }

    isLoadingHistory.value = true
    errorMessage.value = ''

    try {
      const response = await getChatHistory(organizationId, roomId)
      messages.value = response.data || []
    } catch (error) {
      console.error('Failed to load chat history:', error)
      errorMessage.value = '채팅 기록을 불러오는데 실패했습니다.'
    } finally {
      isLoadingHistory.value = false
    }
  }

  const connect = async () => {
    if (isConnecting.value || isConnected.value) {
      return
    }

    // 먼저 채팅 히스토리 로드
    await loadChatHistory()

    isConnecting.value = true
    errorMessage.value = ''

    const onMessageReceived = (message) => {
      console.log('=== onMessageReceived 콜백 실행 ===', message)
      messages.value.push(message)
      console.log('=== messages 배열에 추가 완료 ===', messages.value.length)
    }

    const onConnected = () => {
      isConnected.value = true
      isConnecting.value = false
      console.log('Chat connected for room:', roomId)
    }

    const onError = (error) => {
      isConnecting.value = false
      isConnected.value = false
      errorMessage.value = '채팅 연결에 실패했습니다.'
      console.error('WebSocket error:', error)
    }

    // roomId를 createChatSocket에 전달
    client = createChatSocket(roomId, onMessageReceived, onConnected, onError)
    if (client) {
      client.activate()
    }
  }

  const disconnect = () => {
    if (client) {
      client.deactivate()
      client = null
      isConnected.value = false
      isConnecting.value = false
    }
  }

  const sendMessage = (content, imageUrl = null) => {
    if (!isConnected.value) {
      console.error('Cannot send message: not connected')
      return false
    }

    if (!content && !imageUrl) {
      console.error('Cannot send empty message')
      return false
    }

    const messageData = {
      roomId: roomId,
      content: content ? content.trim() : '',
      imageUrl: imageUrl,
      admin: isAdmin // 백엔드 MessageRequestDTO의 admin 필드에 맞춤
    }

    publishMessage(client, messageData)
    return true
  }

  // 컴포넌트 언마운트 시 자동으로 연결 해제
  onUnmounted(() => {
    disconnect()
  })

  return {
    messages,
    isConnected,
    isConnecting,
    isLoadingHistory,
    errorMessage,
    connect,
    disconnect,
    sendMessage,
    loadChatHistory
  }
}
