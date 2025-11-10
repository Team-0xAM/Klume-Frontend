<template>
  <div class="room-detail-page">
    <!-- <Sidebar /> -->

    <div class="content">
      <h2>회의실 자세히 보기</h2>

      <!-- 상세 정보 카드 -->
      <div class="detail-card">
        <img :src="room.imageUrl || defaultImage" class="room-image" />

        <div class="info">
          <p><strong>회의실 이름</strong> {{ room.name }}</p>
          <p><strong>수용 가능 인원</strong> {{ room.capacity }}명</p>
          <p><strong>설명</strong> {{ room.description || '-' }}</p>

          <button class="edit-btn">수정하기</button>
        </div>
      </div>

      <!-- 이용 가능 시간 -->
      <div class="time-header">
        <h3>이용 가능 시간</h3>
        <span>총 {{ availableTimes.length }}개</span>
        <button class="add-btn" @click="showAddModal = true">추가하기</button>
      </div>

      <table class="time-table">
        <thead>
          <tr>
            <th>No</th>
            <th>이름</th>
            <th>이용 시간</th>
            <th>간격</th>
            <th>예약 오픈</th>
            <th>반복요일</th>
            <th>반복 기간</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(t, idx) in availableTimes" :key="t.id">
            <td>{{ idx + 1 }}</td>
            <td>{{ t.name }}</td>
            <td>{{ t.startTime }} - {{ t.endTime }}</td>
            <td>{{ t.interval || '-' }}</td>
            <td>{{ t.openTime }}</td>
            <td>{{ t.repeatDay || '-' }}</td>
            <td>{{ t.repeatPeriod || '-' }}</td>
            <td>
              <button class="small-btn">수정</button>
              <button class="small-btn danger">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>

      <AddAvailableTimeModal
        v-if="showAddModal"
        @close="showAddModal = false"
        @save="fetchAvailableTimes"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
// import Sidebar from "@/components/layout/Sidebar.vue"
import AddAvailableTimeModal from "@/components/room/AddAvailableTimeModal.vue"
import { getRoomDetail } from "@/api/room/roomApi.js"
import { useRoute } from "vue-router"

const route = useRoute()
const organizationId = Number(route.params.organizationId)
const roomId = Number(route.params.roomId)

const room = ref({})
const availableTimes = ref([])
const showAddModal = ref(false)
const defaultImage = '/assets/default-room.png'

async function fetchRoomDetail() {
  const { data } = await getRoomDetail(organizationId, roomId)
  room.value = data
}

async function fetchAvailableTimes() {
  // TODO: 백엔드 연동 후 수정
  availableTimes.value = [
    { id: 1, name: "점심 타임", startTime: "13:00", endTime: "14:00", openTime: "상시" },
    { id: 2, name: "저녁 1타임", startTime: "18:00", endTime: "20:00", openTime: "1일전 00:00" },
  ]
}

onMounted(async () => {
  await fetchRoomDetail()
  await fetchAvailableTimes()
})
</script>

<style scoped>
.room-detail-page { display: flex; min-height: 100vh; background: #f5f6fa; }
.content { flex: 1; padding: 40px 60px; }

/* 상세 카드 */
.detail-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 30px;
}

.room-image {
  width: 280px;
  height: 180px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 24px;
}

.info p { margin-bottom: 10px; }

.edit-btn { background: #002b87; color: white; padding: 8px 16px; border-radius: 6px; }

/* 이용 가능 시간 테이블 */
.time-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}

.add-btn { background: #002b87; color: white; padding: 6px 12px; border-radius: 6px; }

.time-table { width: 100%; background: white; border-collapse: collapse; }

.time-table th, .time-table td {
  padding: 12px; border-bottom: 1px solid #ddd; text-align: center;
}

.small-btn { padding: 4px 8px; font-size: 12px; border-radius: 4px; }
.small-btn.danger { background: #e74c3c; color: #fff; }
</style>
