<template>
  <div class="admin-page">
    <Sidebar /> <!-- Pinia 전역 사이드바 -->
    <MeetingRoomList :rooms="rooms" @add="onAddRoom" />
  </div>
</template>

<script setup>
import MeetingRoomList from './MeetingRoomList.vue'
import { ref } from 'vue'

const rooms = ref([
  { id: 1, name: '3층 회의실', description: '라운지형 회의실...', capacity: 6, availableTime: 5 },
  { id: 2, name: '4층 회의실', description: 'TV모니터, 연결선, 칠판', capacity: 6, availableTime: 3 },
  { id: 3, name: '5층 회의실', description: 'TV모니터, 연결선, 칠판', capacity: 6, availableTime: 3 },
  { id: 4, name: '5층 테이블1', description: 'TV모니터, 연결선', capacity: 4, availableTime: 1 },
  { id: 10, name: '새로운 공간', description: '-', capacity: 2, availableTime: 0 },
])

function onAddRoom() {
  const nextId = rooms.value.length + 1
  rooms.value.push({
    id: nextId,
    name: `새 회의실${nextId}`,
    description: '-',
    capacity: 0,
    availableTime: 0,
  })
}
</script>

<style scoped>
.admin-page {
  display: flex;
  background-color: #f5f6fa;
  min-height: 100vh;
}
</style>
