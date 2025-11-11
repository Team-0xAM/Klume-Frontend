<template>
  <div class="organization-list">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="status-message">
      <p>조직 목록을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="errorMessage" class="status-message error">
      <p>{{ errorMessage }}</p>
    </div>

    <!-- 조직 목록 -->
    <div v-else-if="organizations.length > 0" class="organization-items">
      <div
        v-for="org in organizations"
        :key="org.organizationId"
        class="organization-item"
        @click="$emit('select', org)"
      >
        <div class="org-avatar">
          <img v-if="org.imageUrl" :src="org.imageUrl" :alt="org.name" />
          <span v-else class="org-initial">{{ getInitial(org.name) }}</span>
        </div>
        <div class="org-info">
          <h3 class="org-name">{{ org.name }}</h3>
          <p class="org-preview">클릭하여 문의하기</p>
        </div>
        <div class="org-meta" v-if="org.role">
          <span class="org-role" :class="org.role.toLowerCase()">{{ getRoleText(org.role) }}</span>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="status-message empty">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ccc"
        stroke-width="1.5"
        style="margin-bottom: 16px"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"></path>
      </svg>
      <p>가입한 조직이 없습니다</p>
      <p class="empty-subtitle">조직에 가입하여 관리자와 대화를 시작하세요</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyOrganizations } from '@/api/organization'

const props = defineProps({
  autoLoad: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select'])

const organizations = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// 조직 목록 로드
const loadOrganizations = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await getMyOrganizations()
    organizations.value = response.data || []
  } catch (error) {
    console.error('Failed to load organizations:', error)
    errorMessage.value = '조직 목록을 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 조직명 이니셜 추출
const getInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// 역할 텍스트 변환
const getRoleText = (role) => {
  return role === 'ADMIN' ? '관리자' : '멤버'
}

// 컴포넌트 마운트 시 자동 로드
onMounted(() => {
  if (props.autoLoad) {
    loadOrganizations()
  }
})

// 외부에서 재로드 가능하도록 expose
defineExpose({
  loadOrganizations
})
</script>

<style scoped>
.organization-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.organization-items {
  flex: 1;
  overflow-y: auto;
}

.organization-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.organization-item:hover {
  background-color: #f8f9fb;
}

.organization-item:active {
  background-color: #f0f4ff;
}

.org-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
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
  font-size: 20px;
  font-weight: 700;
  color: #0c1c54;
}

.org-info {
  flex: 1;
  min-width: 0;
}

.org-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0c1c54;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-preview {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.org-meta {
  flex-shrink: 0;
}

.org-role {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.org-role.admin {
  background-color: #fff3e0;
  color: #e65100;
}

.org-role.member {
  background-color: #e3f2fd;
  color: #1565c0;
}

.status-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.status-message.empty p {
  color: #999;
}

.empty-subtitle {
  margin-top: 8px !important;
  font-size: 13px !important;
  color: #bbb !important;
}

/* 스크롤바 스타일 */
.organization-items::-webkit-scrollbar {
  width: 6px;
}

.organization-items::-webkit-scrollbar-track {
  background: #f8f9fb;
}

.organization-items::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.organization-items::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
