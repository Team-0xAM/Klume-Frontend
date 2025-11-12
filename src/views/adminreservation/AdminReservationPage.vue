<template>
  <div class="reservation-page">
    <!-- 제목 -->
    <div class="header">
      <h2>예약 관리</h2>
      <p>사용자들의 예약 관리를 위한 공간입니다.</p>
    </div>

    <!-- 상단: 주차/날짜 네비 + 보기 전환 버튼 -->
    <div class="top-bar">
      <div class="week-nav">
        <button @click="prevDate">&lt;</button>
        <span class="current-label">{{ currentLabel }}</span>
        <button @click="nextDate">&gt;</button>
      </div>
      <button class="toggle-btn" @click="toggleView">
        {{ viewMode === 'week' ? '일별로 보기 🗓️' : '주별로 보기 📅' }}
      </button>
    </div>

    <!-- ✅ 주별 보기 -->
    <div v-if="viewMode === 'week'" class="week-view">
      <div class="legend">
        <span class="dot green"></span> 예약 가능
        <span class="dot red"></span> 예약 완료
        <span class="dot gray"></span> 예약 오픈 예정
      </div>

      <div class="table-wrapper">
        <table class="reservation-table">
          <thead>
            <tr>
              <th>공간명</th>
              <th v-for="(day, i) in days" :key="i">{{ day.date }}({{ day.label }})</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(room, i) in rooms" :key="i">
              <td>{{ room.name }}</td>
              <td v-for="(day, j) in days" :key="j">
                <div v-for="(slot, k) in room.schedule[day.label]" :key="k">
                  <span :class="statusClass(slot.status)">{{ slot.time }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ✅ 일별 보기 -->
    <div v-else class="day-view">
      <h3 class="date-title">{{ currentLabel }} 이용 내역</h3>

      <div class="section">
        <h4>이용 예정인 회의실</h4>
        <div
          v-for="(item, i) in todayReservations.upcoming"
          :key="'up-'+i"
          class="card"
        >
          <div class="card-main">
            <div class="left">
              <span class="room-name">{{ item.room }}</span>
              <span class="tag upcoming">이용예정</span>
            </div>
            <div class="info">
              <span class="time">🕒 {{ item.time }}</span>
              <span class="user">👤 {{ item.user }}</span>
            </div>
            <button class="cancel-btn">취소</button>
          </div>
        </div>
      </div>

      <div class="section">
        <h4>이용 종료된 회의실</h4>
        <div
          v-for="(item, i) in todayReservations.finished"
          :key="'fin-'+i"
          class="card finished"
        >
          <div class="card-main">
            <div class="left">
              <span class="room-name">{{ item.room }}</span>
              <span class="tag finished">이용종료</span>
            </div>
            <div class="info">
              <span class="time">🕒 {{ item.time }}</span>
              <span class="user">👤 {{ item.user }}</span>
            </div>
            <button class="cancel-btn">완료</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const viewMode = ref('week') // 'week' or 'day'
const currentLabel = ref('11월 3일')
const days = ref([
  { date: '3일', label: '월' },
  { date: '4일', label: '화' },
  { date: '5일', label: '수' },
  { date: '6일', label: '목' },
  { date: '7일', label: '금' },
])

const rooms = ref([
  {
    name: '3층 회의실',
    schedule: {
      월: [
        { time: '13:00 - 14:00', status: 'done' },
        { time: '18:00 - 20:00', status: 'done' },
      ],
      화: [{ time: '20:00 - 22:00', status: 'available' }],
      수: [],
      목: [],
      금: [],
    },
  },
  {
    name: '4층 회의실',
    schedule: {
      월: [{ time: '13:00 - 14:00', status: 'available' }],
      화: [],
      수: [],
      목: [],
      금: [],
    },
  },
])

const todayReservations = ref({
  upcoming: [
    { room: '3층 회의실', time: '18:00 - 20:00', user: '19기 정유진' },
    { room: '4층 회의실', time: '20:00 - 22:00', user: '19기 정유진' },
  ],
  finished: [
    { room: '5층 테이블1', time: '13:00 - 14:00', user: '19기 정유진' },
  ],
})

function toggleView() {
  viewMode.value = viewMode.value === 'week' ? 'day' : 'week'
}
function prevDate() {}
function nextDate() {}
function statusClass(status) {
  return {
    available: 'status available',
    done: 'status done',
    pending: 'status pending',
  }[status]
}
</script>

<style scoped>
.reservation-page {
  padding: 40px 5%;
  background-color: #fff;
  min-height: 100vh;
}

/* 상단 */
.header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #001f5c;
}

.header p {
  color: #555;
  font-size: 14px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 15px;
  flex-wrap: wrap;
  gap: 12px;
}

.week-nav {
  display: flex;
  align-items: center;
}

.week-nav button {
  background: none;
  border: none;
  color: #002b87;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}

.current-label {
  font-weight: 700;
  margin: 0 10px;
  color: #111;
}

.toggle-btn {
  background: none;
  border: 1px solid #002b87;
  border-radius: 6px;
  color: #002b87;
  font-weight: 600;
  padding: 6px 12px;
  cursor: pointer;
}

/* 주별 보기 */
.legend {
  font-size: 13px;
  color: #555;
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 3px;
}

.green { background: #1bb978; }
.red { background: #e44b4b; }
.gray { background: #999; }

.table-wrapper {
  overflow-x: auto;
}

.reservation-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border: 1px solid #ddd;
  min-width: 600px;
}

.reservation-table th,
.reservation-table td {
  border: 1px solid #ddd;
  padding: 10px;
}

.status.available {
  color: #1bb978;
}
.status.done {
  color: #e44b4b;
}
.status.pending {
  color: #999;
}

/* 일별 보기 */
.day-view {
  margin-top: 20px;
}

.section {
  margin-top: 30px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-name {
  font-weight: 700;
}

.tag {
  font-size: 12px;
  border-radius: 12px;
  padding: 3px 8px;
}

.tag.upcoming {
  background-color: #e7f6ef;
  color: #1bb978;
}

.tag.finished {
  background-color: #f0f0f0;
  color: #777;
}

.info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #333;
}

.cancel-btn {
  align-self: flex-end;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #f6f6f6;
}

/* ✅ 반응형 */
@media (max-width: 768px) {
  .header h2 {
    font-size: 18px;
  }

  .toggle-btn {
    font-size: 13px;
    padding: 5px 10px;
  }

  .card {
    padding: 12px;
  }

  .info {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .reservation-page {
    padding: 20px;
  }

  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .week-nav button {
    font-size: 14px;
  }

  .current-label {
    font-size: 14px;
  }
}
</style>
