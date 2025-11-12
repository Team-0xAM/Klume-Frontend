<template>
  <div class="reservation-page">
    <div class="header">
      <h2>예약하기</h2>
      <p>회의실별 예약 가능 현황을 확인하고 예약할 수 있습니다.</p>
    </div>

    <div class="week-nav">
      <button @click="prevWeek">&lt;</button>
      <span>{{ weekLabel }}</span>
      <button @click="nextWeek">&gt;</button>
    </div>

    <table v-if="reservations.length" class="reservation-table">
      <thead>
        <tr>
          <th>공간명</th>
          <th v-for="(day, i) in days" :key="i">{{ formatDay(day) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="room in reservations" :key="room.roomId">
          <td class="room-name">{{ room.roomName }}</td>
          <td v-for="(day, j) in days" :key="j">
            <div
              v-for="slot in room.days[day]"
              :key="slot.time"
              class="slot"
              :class="slot.status"
              @click="goDetail(room.roomId, day)"
            >
              {{ slot.time }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="loading">예약 정보를 불러오는 중...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const reservations = ref([])
const days = ref([])
const weekLabel = ref('11월 1주')

onMounted(() => loadMockData())

// -------------------- 🔹 더미 데이터 --------------------
function loadMockData() {
  const mock = [
    {
      roomId: 1,
      roomName: '3층 회의실',
      days: {
        '2025-11-10': [
          { time: '13:00~14:00', status: 'BOOKED' },
          { time: '18:00~20:00', status: 'OPEN' },
        ],
        '2025-11-11': [
          { time: '13:00~14:00', status: 'LOCKED' },
          { time: '20:00~22:00', status: 'MINE' },
        ],
        '2025-11-12': [],
        '2025-11-13': [],
        '2025-11-14': [],
      },
    },
    {
      roomId: 2,
      roomName: '5층 회의실',
      days: {
        '2025-11-10': [
          { time: '15:00~16:00', status: 'LOCKED' },
          { time: '18:00~19:00', status: 'BOOKED' },
        ],
        '2025-11-11': [
          { time: '13:00~14:00', status: 'OPEN' },
          { time: '20:00~22:00', status: 'LOCKED' },
        ],
        '2025-11-12': [],
        '2025-11-13': [],
        '2025-11-14': [],
      },
    },
  ]
  reservations.value = mock
  days.value = Object.keys(mock[0].days)
}
// --------------------------------------------------------

function formatDay(dateStr) {
  const d = new Date(dateStr)
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getDate()}일(${dayNames[d.getDay()]})`
}

function prevWeek() {}
function nextWeek() {}

function goDetail(roomId, date) {
  router.push(`/reservation/${roomId}?date=${date}`)
}
</script>

<style scoped>
.reservation-page { flex: 1; padding: 40px 60px; }
.header h2 { font-size: 22px; font-weight: 700; color: #001f5c; }
.week-nav { display: flex; justify-content: center; align-items: center; gap: 10px; margin: 25px 0; }
.reservation-table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; }
.reservation-table th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
.room-name { font-weight: 700; background: #f5f7fa; }
.slot { border-radius: 4px; margin: 2px 0; cursor: pointer; padding: 3px 6px; }
.slot.OPEN { background: #e8f9e5; color: #1bb978; }
.slot.BOOKED { background: #f3f3f3; color: #999; }
.slot.MINE { background: #002b87; color: #fff; }
.slot.LOCKED { background: #f0f0f0; color: #aaa; }
</style>
