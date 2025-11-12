<template>
  <div class="room-detail">
    <div class="room-header">
      <img src="https://via.placeholder.com/200x150" class="room-image" />
      <div class="room-info">
        <h2>{{ room.name }}</h2>
        <p>수용 가능 인원 | {{ room.capacity }}</p>
        <p>주소 | {{ room.address }}</p>
        <p>장비 | {{ room.equipments }}</p>
      </div>
    </div>

    <div class="date-nav">
      <button @click="prevDate">&lt;</button>
      <span>{{ formattedDate }}</span>
      <button @click="nextDate">&gt;</button>
    </div>

    <h3>이용 가능 시간</h3>

    <div
      v-for="slot in slots"
      :key="slot.time"
      class="slot-row"
      :class="slot.status"
    >
      <div class="time">{{ slot.time }}</div>
      <div class="right">
        <div v-if="slot.status === 'LOCKED'" class="locked">
          <div>{{ slot.openLabel }}</div>
          <div class="countdown">남은 시간 {{ slot.remaining }}</div>
        </div>

        <button
          v-else-if="slot.status === 'OPEN'"
          class="open-btn"
          @click="reserve(slot)"
        >
          예약 가능
        </button>

        <div v-else-if="slot.status === 'BOOKED'" class="booked">
          예약 완료
        </div>

        <div v-else-if="slot.status === 'MINE'" class="mine">
          내 예약
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomId = route.params.roomId
const date = ref(route.query.date || '2025-11-10')
const room = ref({})
const slots = ref([])
let timer

onMounted(() => {
  loadMockData()
  startCountdown()
})
onUnmounted(() => clearInterval(timer))

// -------------------- 🔹 더미 데이터 --------------------
function loadMockData() {
  room.value = {
    id: roomId,
    name: roomId === '1' ? '3층 회의실' : '5층 회의실',
    capacity: 6,
    address: '서울시 동작구 ... 3층',
    equipments: 'TV모니터, 연결선, 칠판',
  }

  const now = new Date()
  slots.value = [
    {
      time: '13:00~14:00',
      openAt: new Date(now.getTime() + 1000 * 60 * 2), // 2분 뒤 오픈
      openLabel: '오늘 2분 후 오픈 예정',
      status: 'LOCKED',
    },
    {
      time: '15:00~16:00',
      openAt: new Date(now.getTime() + 1000 * 60 * 5), // 5분 뒤
      openLabel: '오늘 5분 후 오픈 예정',
      status: 'LOCKED',
    },
    {
      time: '18:00~20:00',
      status: 'OPEN',
      openAt: null,
      openLabel: '예약 가능',
    },
    {
      time: '20:00~22:00',
      status: 'BOOKED',
      openAt: null,
    },
  ]

  slots.value.forEach(s => {
    s.remaining = s.status === 'LOCKED' ? getRemaining(s.openAt) : null
  })
}
// --------------------------------------------------------

function getRemaining(openAt) {
  const now = new Date()
  const diff = Math.max(0, openAt - now)
  const min = Math.floor(diff / 60000)
  const sec = Math.floor((diff % 60000) / 1000)
  return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function startCountdown() {
  timer = setInterval(() => {
    slots.value = slots.value.map(s => {
      if (s.status === 'LOCKED') {
        const remaining = getRemaining(s.openAt)
        const openTime = new Date(s.openAt)
        if (openTime <= new Date()) s.status = 'OPEN'
        return { ...s, remaining }
      }
      return s
    })
  }, 1000)
}

function reserve(slot) {
  alert(`${slot.time} 예약 완료!`)
  slot.status = 'MINE'
}

function prevDate() {}
function nextDate() {}

const formattedDate = computed(() => {
  const d = new Date(date.value)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
})
</script>

<style scoped>
.room-detail { flex: 1; padding: 40px 60px; background: #fff; }
.room-header { display: flex; gap: 40px; margin-bottom: 20px; }
.room-image { width: 200px; height: 150px; background: #f3f3f3; border-radius: 8px; }
.slot-row { display: flex; justify-content: space-between; align-items: center;
  border: 1px solid #eee; padding: 12px 16px; border-radius: 6px; margin-bottom: 8px; }
.slot-row.LOCKED { background-color: #f5f5f5; }
.slot-row.OPEN { background-color: #fff5f5; }
.slot-row.BOOKED { background-color: #efefef; color: #888; }
.slot-row.MINE { background-color: #e7f1ff; }
.time { font-weight: 600; }
.locked { text-align: right; font-size: 13px; color: #777; }
.countdown { font-size: 13px; color: #002b87; }
.open-btn { background-color: #e44b4b; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
.open-btn:hover { background-color: #c13b3b; }
</style>
