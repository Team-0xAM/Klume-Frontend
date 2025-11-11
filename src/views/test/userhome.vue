<template>
  <div class="home-container">
    <!-- 오늘 예약 현황 -->
    <section class="today-section">
      <h2>오늘의 예약 현황</h2>
      <div v-if="todayReservations.length">
        <div v-for="(res, i) in todayReservations" :key="i" class="today-card">
          <div class="left">
            <span class="room">{{ res.room }}</span>
            <span class="tag">{{ res.status }}</span>
          </div>
          <div class="right">
            <span class="time">🕒 {{ res.time }}</span>
            <span class="user">👤 {{ res.user }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty">오늘 예약이 없습니다.</div>
    </section>

    <!-- 공지사항 -->
    <section class="notice-section">
      <h2>공지사항</h2>
      <ul>
        <li v-for="notice in notices" :key="notice.id" @click="goNotice(notice.id)">
          <span class="title">{{ notice.title }}</span>
          <span class="date">{{ notice.date }}</span>
        </li>
      </ul>
    </section>

    <!-- 회의실별 예약 현황 -->
    <section class="room-section">
      <div class="header-row">
        <h2>회의실별 당일 예약 현황</h2>
        <select v-model="selectedRoom" class="room-select">
          <option v-for="room in rooms" :key="room" :value="room">{{ room }}</option>
        </select>
      </div>

      <div class="time-grid">
        <div
          v-for="(slot, i) in filteredSlots"
          :key="i"
          class="time-slot"
          :class="slot.status"
        >
          <span>{{ slot.time }}</span>
        </div>
      </div>

      <div class="legend">
        <span><span class="dot open"></span> 오픈된 예약</span>
        <span><span class="dot locked"></span> 오픈 전</span>
        <span><span class="dot other"></span> 타인 예약</span>
        <span><span class="dot mine"></span> 내 예약</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* 오늘 예약 현황 */
const todayReservations = ref([
  { room: '3층 회의실', time: '18:00 - 20:00', user: '나', status: '이용예정' },
  { room: '5층 테이블2', time: '13:00 - 14:00', user: '나', status: '이용완료' },
])

/* 공지사항 */
const notices = ref([
  { id: 1, title: '회의실 이용 인증제 시행 안내', date: '2025.11.08' },
  { id: 2, title: '예약 취소 패널티 정책 변경', date: '2025.11.07' },
  { id: 3, title: '시스템 점검 안내 (11.12)', date: '2025.11.06' },
  { id: 4, title: '공유공간 이용 수칙 안내', date: '2025.11.03' },
  { id: 5, title: '11월 이용자 만족도 조사', date: '2025.11.01' },
])

function goNotice(id) {
  router.push(`/notice/${id}`)
}

/* 회의실별 예약 현황 */
const rooms = ref(['3층 회의실', '4층 회의실', '5층 회의실', '5층 테이블1'])
const selectedRoom = ref(rooms.value[0])

const allSlots = ref({
  '3층 회의실': [
    { time: '10:00 - 12:00', status: 'open' },
    { time: '12:00 - 14:00', status: 'other' },
    { time: '14:00 - 16:00', status: 'mine' },
    { time: '18:00 - 20:00', status: 'locked' },
  ],
  '4층 회의실': [
    { time: '10:00 - 12:00', status: 'open' },
    { time: '14:00 - 16:00', status: 'open' },
    { time: '18:00 - 20:00', status: 'other' },
  ],
  '5층 회의실': [
    { time: '10:00 - 12:00', status: 'mine' },
    { time: '12:00 - 14:00', status: 'locked' },
    { time: '16:00 - 18:00', status: 'other' },
  ],
  '5층 테이블1': [
    { time: '10:00 - 12:00', status: 'open' },
    { time: '12:00 - 14:00', status: 'mine' },
  ],
})

const filteredSlots = computed(() => allSlots.value[selectedRoom.value])
</script>

<style scoped>
.home-container {
  flex: 1;
  padding: 40px 60px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 오늘 예약 */
.today-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #001f5c;
  margin-bottom: 10px;
}

.today-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.today-card .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.today-card .room {
  font-weight: 600;
}

.today-card .tag {
  background: #e7f6ef;
  color: #1bb978;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.today-card .time,
.today-card .user {
  color: #444;
  font-size: 14px;
}

.empty {
  padding: 16px;
  color: #777;
  font-size: 14px;
}

/* 공지사항 */
.notice-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #001f5c;
  margin-bottom: 10px;
}

.notice-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-section li {
  display: flex;
  justify-content: space-between;
  padding: 10px 6px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.notice-section li:hover {
  background-color: #f8f8f8;
}

.notice-section .title {
  color: #222;
}

.notice-section .date {
  color: #777;
  font-size: 13px;
}

/* 회의실별 예약 현황 */
.room-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #001f5c;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.room-select {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 5px 10px;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.time-slot {
  padding: 14px;
  border-radius: 8px;
  text-align: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

/* 상태 색상 */
.open {
  background-color: #1bb978;
}
.locked {
  background-color: #bfbfbf;
}
.other {
  background-color: #888;
}
.mine {
  background-color: #002b87;
}

.legend {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  color: #444;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}
.dot.open { background-color: #1bb978; }
.dot.locked { background-color: #bfbfbf; }
.dot.other { background-color: #888; }
.dot.mine { background-color: #002b87; }

/* 반응형 */
@media (max-width: 768px) {
  .home-container {
    padding: 20px;
  }
  .time-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
