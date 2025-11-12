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
      <button class="add-btn" @click="showAddModal = true">회의실 추가</button>
    </div>

    <!-- 목록 테이블 -->
    <table class="room-table">
      <thead>
        <tr>
          <th>No</th>
          <th>회의실 이름</th>
          <th>설명</th>
          <th>수용 인원</th>
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
          <td>{{ index + 1 }}</td>
          <td>{{ room.name }}</td>
          <td>{{ room.description || '-' }}</td>
          <td>{{ room.capacity }}</td>
          <td>
            <span v-if="room.availableTime > 0">{{ room.availableTime }}개</span>
            <span v-else style="color: #999;">미등록</span>
          </td>
        </tr>
      </tbody>
    </table>

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
      availableTime: 0 // 초기화
    }))
    for (const room of rooms.value) {
      const res = await getAvailableTimes(props.organizationId, room.id)
      room.availableTime = res.data.length // 개수 반영
    }
  } catch (error) {
    console.error("회의실 목록 조회 실패:", error)
  }
}

function goToDetail(roomId) {
  router.push(`/organization/${props.organizationId}/admin/rooms/${roomId}`)
}

// 모달에서 넘어온 데이터 → 서버에 전달
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
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 5px;
}

.header p {
  font-size: 14px;
  color: #555;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.table-header span {
  font-size: 14px;
  margin-right: 10px;
  color: #555;
}

.table-header span.count {
  color: #f9c802;
  font-weight: 700;
  margin: 0;
}

.add-btn {
  background-color: #002b87;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #0044cc;
}

.room-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.room-table th {
  background-color: #f8f9fa;
  padding: 12px 10px;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
  text-align: center;
}

.room-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
  text-align: center;
}
</style>
