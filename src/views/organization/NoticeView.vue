<template>
  <div class="notice-view">
    <div class="page-header">
      <h1>공지사항</h1>
      <p class="subtitle">조직의 공지사항을 확인하세요</p>
    </div>

    <div class="notice-list">
      <!-- TODO: 공지사항 목록 구현 -->
      <div class="empty-state">
        <p>등록된 공지사항이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const notices = ref([])

onMounted(() => {
  // TODO: API 호출하여 공지사항 목록 가져오기
  const organizationId = route.params.organizationId
  console.log('Organization ID:', organizationId)
})
</script>

<style scoped>
.notice-view {
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

.notice-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
  font-size: 16px;
}
</style>
