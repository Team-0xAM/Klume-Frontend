<template>
  <div class="organization-view">
    <!-- 상단 헤더 -->
    <div class="header-section">
      <h2 class="page-title">조직 대시보드</h2>
      <button class="join-btn" @click="goJoinPage">새로운 조직 가입하기</button>
    </div>

    <!-- 구분선 -->
    <div class="divider"></div>

    <!-- 카드 리스트 -->
    <div class="card-section">
      <!-- 로딩 중 -->
      <div v-if="isLoading" class="loading-container">
        <p class="loading-text">조직 목록을 불러오는 중...</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-else-if="errorMessage" class="error-container">
        <p class="error-text">{{ errorMessage }}</p>
        <button class="retry-btn" @click="fetchOrganizations">다시 시도</button>
      </div>

      <!-- 조직 목록 -->
      <div v-else>
        <div class="card-header">
          <span class="total-text">총 <b>{{ organizations.length }}</b>개</span>
        </div>

        <div class="card-grid">
          <OrganizationCard
            v-for="org in organizations"
            :key="org.id"
            :id="org.id"
            :title="org.name"
            :description="org.description"
            :imageUrl="org.logo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OrganizationCard from '@/components/common/OrganizationCard.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyOrganizations } from '@/api/organization'

const router = useRouter()
const organizations = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// 조직 목록 불러오기
const fetchOrganizations = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await getMyOrganizations()
    console.log('[OrganizationView] 조직 목록:', response.data)

    // 백엔드 응답 데이터 형식에 맞게 매핑
    organizations.value = response.data.map(org => ({
      id: org.id || org.organizationId,
      name: org.name || org.organizationName,
      description: org.description || '',
      logo: org.logo || org.logoUrl || '/assets/images/no_image.png'
    }))
  } catch (error) {
    console.error('[OrganizationView] 조직 목록 조회 실패:', error)
    errorMessage.value = '조직 목록을 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 컴포넌트 마운트 시 조직 목록 불러오기
onMounted(() => {
  fetchOrganizations()
})

const goJoinPage = () => {
  router.push('/organization/join')
}
</script>

<style scoped>
.organization-view {
  padding: 60px 80px;
  background-color: #f8f9fb;
  min-height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0c1c54;
}

.join-btn {
  background-color: #0c1c54;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.join-btn:hover {
  background-color: #142a80;
}

.divider {
  margin: 20px 0;
  border-bottom: 1px solid #cdd3e1;
}

.card-section {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  font-size: 14px;
  color: #0c1c54;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.total-text b {
  color: #1a2a75;
}

/* 로딩 및 에러 상태 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.loading-text {
  font-size: 16px;
  color: #0c1c54;
  font-weight: 500;
}

.error-text {
  font-size: 16px;
  color: #e74c3c;
  margin-bottom: 16px;
}

.retry-btn {
  background-color: #0c1c54;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.retry-btn:hover {
  background-color: #142a80;
}
</style>
