<template>
  <div class="organization-manage-view">
    <div class="page-header">
      <h1>조직 관리</h1>
      <p class="subtitle">조직 정보 및 멤버를 관리합니다</p>
    </div>

    <div class="manage-content">
      <div class="section">
        <h2>조직 정보</h2>
        <!-- TODO: 조직 정보 수정 폼 -->
        <div class="info-card">
          <p>조직 정보 관리 기능이 추가될 예정입니다</p>
        </div>
      </div>

      <div class="section">
        <h2>멤버 관리</h2>
        <!-- TODO: 멤버 목록 및 권한 관리 -->
        <div class="info-card">
          <p>멤버 관리 기능이 추가될 예정입니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  // TODO: API 호출하여 조직 정보 가져오기
  const organizationId = route.params.organizationId
  console.log('Organization ID:', organizationId)
})
</script>

<style scoped>
.organization-manage-view {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

.manage-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>
