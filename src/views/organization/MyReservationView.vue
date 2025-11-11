<template>
  <div class="my-reservation-view">
    <div class="page-header">
      <h1>내 예약 현황</h1>
      <p class="subtitle">내가 예약한 회의실 목록입니다</p>
    </div>

    <div class="reservation-list">
      <!-- TODO: 예약 목록 구현 -->
      <div class="empty-state">
        <p>예약 내역이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const reservations = ref([])

onMounted(() => {
  // TODO: API 호출하여 내 예약 목록 가져오기
  const organizationId = route.params.organizationId
  console.log('Organization ID:', organizationId)
})
</script>

<style scoped>
.my-reservation-view {
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

.reservation-list {
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
