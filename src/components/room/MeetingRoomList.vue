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
      <button class="add-btn" @click="showModal = true">회의실 추가</button>
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
        <tr v-for="(room, index) in rooms" :key="room.id">
          <td>{{ index + 1 }}</td>
          <td>{{ room.name }}</td>
          <td>{{ room.description || '-' }}</td>
          <td>{{ room.capacity }}</td>
          <td>{{ room.availableTime }}</td>
        </tr>
      </tbody>
    </table>

    <!-- ✅ 모달 연결 -->
    <AddRoomModal
      v-if="showModal"
      @close="showModal = false"
      @save="addRoom"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AddRoomModal from './AddRoomModal.vue' // ✅ 중괄호 제거

const props = defineProps({
  rooms: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['update:rooms'])
const showModal = ref(false)
const roomCount = computed(() => props.rooms.length)

function addRoom(newRoom) {
  const updatedRooms = [...props.rooms, { id: Date.now(), ...newRoom }]
  emit('update:rooms', updatedRooms)
  showModal.value = false
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
}

.room-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
}
</style>
