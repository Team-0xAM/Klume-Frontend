import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

/**
 * 채팅용 WebSocket 클라이언트 생성
 * @param {number} roomId - 채팅방 ID
 * @param {Function} onMessageReceived - 메시지 수신 콜백
 * @param {Function} onConnected - 연결 성공 콜백
 * @param {Function} onError - 에러 콜백
 * @returns {Client} STOMP 클라이언트
 */
export const createChatSocket = (roomId, onMessageReceived, onConnected, onError) => {
  // JWT 토큰 가져오기
  const token = localStorage.getItem('accessToken')

  if (!token) {
    console.error('No access token found')
    if (onError) {
      onError(new Error('No access token'))
    }
    return null
  }

  // SockJS 소켓 생성
  const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws`)

  // STOMP 클라이언트 생성
  const stompClient = new Client({
    webSocketFactory: () => socket,

    // JWT 토큰을 헤더에 포함
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },

    // 연결 성공 시
    onConnect: (frame) => {
      console.log('WebSocket 연결 성공', frame)

      // 특정 채팅방 구독
      stompClient.subscribe(`/topic/chat-room/${roomId}`, (message) => {
        try {
          const data = JSON.parse(message.body)
          console.log('새 메시지:', data)

          if (onMessageReceived) {
            onMessageReceived(data)
          }
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      })

      if (onConnected) {
        onConnected()
      }
    },

    // 연결 실패 시
    onStompError: (frame) => {
      console.error('STOMP 에러:', frame)
      if (onError) {
        onError(frame)
      }
    },

    // WebSocket 연결 해제 시
    onDisconnect: () => {
      console.log('WebSocket 연결 해제')
    },

    // 디버그 로그 (개발 환경에서만)
    debug: (str) => {
      if (import.meta.env.DEV) {
        console.log('STOMP debug:', str)
      }
    },

    // 재연결 설정
    reconnectDelay: 5000, // 5초 후 재연결 시도
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  })

  return stompClient
}

/**
 * 메시지 전송
 * @param {Client} client - STOMP 클라이언트
 * @param {object} messageData - 메시지 데이터 { roomId, content, isAdmin }
 */
export const sendMessage = (client, messageData) => {
  if (!client || !client.connected) {
    console.error('WebSocket이 연결되지 않았습니다.')
    return false
  }

  try {
    console.log('=== 메시지 전송 ===', messageData)
    client.publish({
      destination: '/app/chat',
      body: JSON.stringify(messageData)
    })
    console.log('=== 메시지 전송 완료 ===')
    return true
  } catch (error) {
    console.error('Failed to send message:', error)
    return false
  }
}
