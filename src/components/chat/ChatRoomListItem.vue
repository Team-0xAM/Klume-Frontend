<template>
  <div class="chat-room-item" @click="$emit('click')">
    <div class="room-header">
      <div class="user-info">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-details">
          <div class="user-name">{{ chatRoom.createdByEmail || '알 수 없음' }}</div>
          <div class="last-message">{{ lastMessage }}</div>
        </div>
      </div>
      <div class="room-meta">
        <div class="last-time">{{ formattedTime }}</div>
      </div>
    </div>

    <div v-if="showAssignButton" class="action-area" @click.stop>
      <button
        v-if="!chatRoom.assignedToName"
        class="assign-button"
        @click="$emit('assign')"
      >
        담당하기
      </button>
      <div v-else class="assigned-info">
        <span class="assigned-label">담당: {{ chatRoom.assignedToName }}</span>
        <button
          v-if="isMyAssignment"
          class="unassign-button"
          @click="$emit('unassign')"
        >
          담당 해제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chatRoom: {
    type: Object,
    required: true
  },
  showAssignButton: {
    type: Boolean,
    default: true
  },
  currentUserEmail: {
    type: String,
    default: ''
  },
  currentUserId: {
    type: Number,
    default: null
  }
})

defineEmits(['click', 'assign', 'unassign'])

const userInitial = computed(() => {
  const email = props.chatRoom.createdByEmail || '?'
  return email.charAt(0).toUpperCase()
})

const lastMessage = computed(() => {
  return '메시지 없음'
})

const formattedTime = computed(() => {
  if (!props.chatRoom.lastMessageAt) return ''

  try {
    const date = new Date(props.chatRoom.lastMessageAt)
    const now = new Date()
    const diff = now - date

    // 오늘인 경우 시간만 표시
    if (diff < 24 * 60 * 60 * 1000 && now.getDate() === date.getDate()) {
      const hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }

    // 어제인 경우
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (yesterday.getDate() === date.getDate()) {
      return '어제'
    }

    // 그 외 날짜 표시
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}-${day}`
  } catch (error) {
    return ''
  }
})

const isMyAssignment = computed(() => {
  // assignedToId (OrganizationMember ID)와 currentUserId (OrganizationMember ID)를 비교
  if (props.chatRoom.assignedToId && props.currentUserId) {
    return props.chatRoom.assignedToId === props.currentUserId
  }
  return false
})
</script>

<style scoped>
.chat-room-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-room-item:hover {
  background-color: #f8f9fb;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0c1c54 0%, #15266b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.last-message {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.unread-badge {
  background-color: #f5c843;
  color: #0c1c54;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.last-time {
  font-size: 11px;
  color: #999;
}

.action-area {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.assign-button {
  padding: 6px 16px;
  background-color: #0c1c54;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Noto Sans KR', sans-serif;
}

.assign-button:hover {
  background-color: #15266b;
}

.assigned-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.assigned-label {
  font-size: 12px;
  color: #666;
  flex: 1;
}

.unassign-button {
  padding: 4px 12px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Noto Sans KR', sans-serif;
}

.unassign-button:hover {
  background-color: #e0e0e0;
  color: #333;
}
</style>
