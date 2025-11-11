<template>
  <div class="reservation-page">
    <!-- 제목 -->
    <div class="header">
      <h2>예약 관리</h2>
      <p>조직 회의실 예약 현황을 확인하고, 필요 시 조정할 수 있습니다.</p>
    </div>

    <!-- 상단: 날짜 네비 + 보기 전환 -->
    <div class="top-bar">
      <div class="week-nav">
        <button @click="prev">〈</button>
        <span class="current-label">{{ displayLabel }}</span>
        <button @click="next">〉</button>
      </div>
      <button class="toggle-btn" @click="toggleView">
        {{ viewMode === 'week' ? '일별로 보기 🗓️' : '주별로 보기 📅' }}
      </button>
    </div>

    <!-- 주별 보기 -->
    <div v-if="viewMode === 'week'" class="week-view">
      <div class="legend">
        <span><span class="dot green"></span> 예약 가능</span>
        <span><span class="dot red"></span> 예약 완료</span>
        <span><span class="dot gray"></span> 예약 오픈 예정</span>
      </div>
      <div class="table-wrapper">
        <table class="reservation-table">
          <thead>
            <tr>
              <th>회의실</th>
              <th v-for="d in weekDays" :key="d">{{ formatDay(d) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in weeklyData" :key="room.roomId">
              <td>{{ room.roomName }}</td>
              <td v-for="day in weekDays" :key="day">
                <div v-for="slot in room.schedule[day]" :key="slot.id">
                  <span :class="statusClass(slot.state)">{{ slot.time }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 일별 보기 -->
    <div v-else class="day-view">
      <h3 class="date-title">{{ selectedDate }} 이용 내역</h3>

      <div class="section">
        <h4>이용 예정</h4>
        <div v-for="r in dayData.upcoming" :key="r.id" class="card">
          <div class="card-main">
            <div class="left">
              <span class="room-name">{{ r.room }}</span>
              <span class="tag upcoming">이용 예정</span>
            </div>
            <div class="info">
              <span>🕒 {{ r.time }}</span>
              <span>👤 {{ r.user }}</span>
            </div>
            <button class="cancel-btn" @click.stop="cancel(r.id)">취소</button>
          </div>
        </div>
      </div>

      <div class="section">
        <h4>이용 종료</h4>
        <div v-for="r in dayData.finished" :key="r.id" class="card finished">
          <div class="card-main">
            <div class="left">
              <span class="room-name">{{ r.room }}</span>
              <span class="tag finished">종료</span>
            </div>
            <div class="info">
              <span>🕒 {{ r.time }}</span>
              <span>👤 {{ r.user }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
// import { getWeeklyReservations, getDailyReservations, cancelReservation } from "@/api/reservationApi.js"

const route = useRoute()
const organizationId = Number(route.params.organizationId)

const viewMode = ref("week")

// 날짜
const today = new Date()
const selectedDate = ref(formatDate(today))
const weekDays = ref(getWeekRange(today))

const weeklyData = ref([])
const dayData = ref({ upcoming: [], finished: [] })

/* 더미데이터용 회의실 이름 */
const roomNames = ["3층 회의실", "4층 회의실", "5층 회의실"]

/* 날짜 + 시간 더미 */
const sampleTimes = ["09:00 - 10:00", "13:00 - 14:00", "18:00 - 20:00"]
const users = ["19기 정유진", "18기 김민수", "20기 이서연"]

// 날짜 포맷 함수
function formatDate(date) {
  return date.toISOString().slice(0, 10)
}
function getWeekRange(baseDate) {
  const start = new Date(baseDate)
  start.setDate(start.getDate() - start.getDay() + 1)
  return [...Array(7)].map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return formatDate(d)
  })
}
function formatDay(d) {
  const day = ["일","월","화","수","목","금","토"][new Date(d).getDay()]
  return `${d.slice(5)}(${day})`
}

// 더미 데이터 생성 함수
function generateWeeklyDummy() {
  weeklyData.value = roomNames.map((name, roomIndex) => ({
    roomId: roomIndex + 1,
    roomName: name,
    schedule: Object.fromEntries(
      weekDays.value.map((day) => [
        day,
        sampleTimes.map((t, idx) => ({
          id: `${roomIndex}-${day}-${idx}`,
          time: t,
          state: idx === 0 ? "done" : idx === 1 ? "pending" : "available"
        }))
      ])
    )
  }))
}

function generateDailyDummy() {
  dayData.value = {
    upcoming: [
      { id: 1, room: "3층 회의실", time: "18:00 - 20:00", user: users[0] },
      { id: 2, room: "4층 회의실", time: "20:00 - 21:00", user: users[1] },
    ],
    finished: [
      { id: 3, room: "5층 회의실", time: "09:00 - 10:00", user: users[2] },
    ]
  }
}

// 보기 전환
function toggleView() {
  viewMode.value = viewMode.value === "week" ? "day" : "week"
  if (viewMode.value === "day") generateDailyDummy()
}

// 날짜 이동
function prev() {
  const target = new Date(selectedDate.value)
  target.setDate(target.getDate() - (viewMode.value === "week" ? 7 : 1))
  selectedDate.value = formatDate(target)
  weekDays.value = getWeekRange(target)
  if (viewMode.value === "week") generateWeeklyDummy()
  else generateDailyDummy()
}

function next() {
  const target = new Date(selectedDate.value)
  target.setDate(target.getDate() + (viewMode.value === "week" ? 7 : 1))
  selectedDate.value = formatDate(target)
  weekDays.value = getWeekRange(target)
  if (viewMode.value === "week") generateWeeklyDummy()
  else generateDailyDummy()
}

// 관리자 예약 취소 (더미)
function cancel(id) {
  alert("관리자 취소 처리 (더미): " + id)
  dayData.value.upcoming = dayData.value.upcoming.filter(i => i.id !== id)
}

  const displayLabel = computed(() => {
    return viewMode.value === "week"
      ? `${weekDays.value[0]} ~ ${weekDays.value[6]}`
      : selectedDate.value
  })

onMounted(() => {
  generateWeeklyDummy()
})

function statusClass(state) {
  return {
    available: "status available",
    done: "status done",
    pending: "status pending",
  }[state]
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

.legend {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 14px;
  color: #555;
  margin: 8px 0 14px;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.green { background-color: #1bb978; } /* 예약 가능 */
.red { background-color: #e44b4b; }   /* 예약 완료 */
.gray { background-color: #aaaaaa; } /* 예약 예정 */

</style>
