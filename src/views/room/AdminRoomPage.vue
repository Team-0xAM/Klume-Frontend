<template>
  <div class="admin-page">
    <MeetingRoomList :organization-id="organizationId" />
  </div>
</template>

<script setup>
import MeetingRoomList from '@/components/room/MeetingRoomList.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const organizationId = ref(Number(route.params.organizationId))

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
  width: 100%;
}
</style>
