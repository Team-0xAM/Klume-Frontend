<template>
  <div class="admin-page">
    <Sidebar />
    <MeetingRoomList :organization-id="organizationId" />
  </div>
</template>

<script setup>
import MeetingRoomList from '@/components/room/MeetingRoomList.vue';
import { ref } from 'vue'

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

const organizationId = ref(1)
</script>

<style scoped>
.admin-page {
  display: flex;
  background-color: #f5f6fa;
  min-height: 100vh;
}
</style>
