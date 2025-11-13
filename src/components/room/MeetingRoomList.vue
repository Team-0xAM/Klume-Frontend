<template>
  <div class="room-container">
    <!-- 제목 영역 -->
    <div class="header">
      <h2>회의실 관리</h2>
      <p>사용 가능한 회의실 및 반복되는 예약 가능 시간을 등록하세요.</p>
    </div>

    <!-- 상단 정보 -->
    <div class="table-header">
      <span>총 <span class="count">{{ roomCount }}</span>개</span>
      <button class="add-btn" @click="showAddModal = true">
        <span class="plus-icon">+</span> 회의실 추가
      </button>
    </div>

    <!-- 목록 테이블 -->
    <div class="table-wrapper">
      <table class="room-table">
        <thead>
          <tr>
            <th>No</th>
            <th>회의실 이름</th>
            <th>설명</th>
            <th>수용 가능 인원</th>
            <th>등록된 이용가능시간</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(room, index) in rooms" 
            :key="room.id"
            class="clickable-row"
            @click="goToDetail(room.id)"
          >
            <td class="room-no">{{ index + 1 }}</td>
            <td class="room-name">{{ room.name }}</td>
            <td class="room-desc">{{ room.description || '-' }}</td>
            <td class="room-capacity">
              <span class="capacity-badge">{{ room.capacity }}명</span>
            </td>
            <td class="room-time">
              <span v-if="room.availableTime > 0" class="time-badge active">{{ room.availableTime }}개</span>
              <span v-else class="time-badge">미등록</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 회의실 등록 모달 -->
    <AddRoomModal
      v-if="showAddModal"
      :organization-id="organizationId"
      @close="showAddModal = false"
      @saved="fetchRooms" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AddRoomModal from './AddRoomModal.vue'
import { getRooms, createRoom, getAvailableTimes } from '@/api/room/roomApi.js'

const props = defineProps({
  organizationId: {
    type: Number,
    required: true
  }
})

const router = useRouter()

const showAddModal = ref(false)

const rooms = ref([])

const roomCount = computed(() => rooms.value.length)

onMounted(fetchRooms)

async function fetchRooms() {
  try {
    const { data } = await getRooms(props.organizationId)
    rooms.value = data.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      availableTime: 0
    }))
    for (const room of rooms.value) {
      const res = await getAvailableTimes(props.organizationId, room.id)
      room.availableTime = res.data.length
    }
  } catch (error) {
    console.error("회의실 목록 조회 실패:", error)
  }
}

function goToDetail(roomId) {
  router.push(`/organization/${props.organizationId}/admin/rooms/${roomId}`)
}

async function addRoom(roomData, imageFile) {
  try {
    const { data } = await createRoom(props.organizationId, roomData, imageFile)

    rooms.value.push({
      ...data,
      availableTime: '-' 
    })

    showAddModal.value = false
  } catch (error) {
    console.error("회의실 등록 실패:", error)
    alert("회의실 등록 실패")
  }
}
</script>

<style scoped>
.room-container {
  flex: 1;
  padding: 40px 60px;
  background-color: #fff;
  border-radius: 16px; 
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #0B174E;
}

.header p {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.table-header span {
  font-size: 16px;
  color: #374151;
  font-weight: 500;
}

.table-header span.count {
  color: #f59e0b;
  font-weight: 700;
  font-size: 18px;
  margin: 0 4px;
}

.add-btn {
  background: #002b87;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;  
  justify-content: center;  
  box-shadow: 0 2px 4px rgba(0, 43, 135, 0.2);
}
.add-btn:hover {
  background: #003399;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 43, 135, 0.3);
}

.add-btn:active {
  transform: translateY(0);
}

.plus-icon {
  font-size: 18px;
  font-weight: 700;
}

.table-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.room-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  background: #fff;
}

.room-table thead {
  background: linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%);
}

.room-table th {
  padding: 16px 20px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  text-align: center;
  font-size: 16px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.room-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
  text-align: center;
  font-size: 16px;
}

.clickable-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-row:hover {
  background-color: #f9fafb;
  transform: scale(1.01);
}

.clickable-row:active {
  background-color: #f3f4f6;
}

.room-no {
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
}

.room-name {
  font-weight: 700;
  color: #0B174E;
  font-size: 15px;
}

.room-desc {
  color: #6b7280;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.capacity-badge {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #93c5fd;
}

.time-badge {
  display: inline-block;
  padding: 6px 14px;
  background: #f3f4f6;
  color: #9ca3af;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
}

.time-badge.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.room-table tbody tr:last-child td {
  border-bottom: none;
}
</style>