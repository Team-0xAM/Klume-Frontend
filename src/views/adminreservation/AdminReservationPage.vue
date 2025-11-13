<template>
  <div class="reservation-page">
    <!-- 제목 -->
    <div class="header">
      <h2>예약 관리</h2>
      <p>조직 회의실 예약 현황을 확인하고, 필요 시 조정할 수 있습니다.</p>
    </div>

    <!-- 상단: 달력 + 보기 전환 -->
    <div class="top-bar">
      <div class="left-controls">
      <button class="nav-btn" @click="prev">
        ◀
      </button>
        <input type="date" v-model="selectedDate" class="date-picker" @change="onDateChange" />
        <button class="nav-btn" @click="next">
          ▶
        </button>

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

      <div class="table-wrapper scrollable">
        <table class="reservation-table">
          <thead>
            <tr>
              <th class="sticky-col">회의실</th>
              <th v-for="d in weekDays" :key="d" class="sticky-top">{{ formatDay(d) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in weeklyData" :key="room.roomId">
              <td class="sticky-col">{{ room.roomName }}</td>
              <td v-for="day in weekDays" :key="day">
                <div v-for="slot in room.schedule[day]" :key="slot.id">
                  <span :class="statusClass(slot.status)">{{ slot.time }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 일별 보기 -->
    <div v-else class="day-view">
      <div class="date-header">
        <h3 class="date-title">{{ selectedDate }} 이용 내역</h3>
        <div class="summary">
          <span class="count available">예약 가능 {{ dayData.available.length }}건</span>
          <span class="count reserved">예약 완료 {{ dayData.reserved.length }}건</span>
          <span class="count pending">오픈 예정 {{ dayData.pending.length }}건</span>
        </div>
      </div>

      <div v-if="!dayData.available.length && !dayData.reserved.length && !dayData.pending.length" class="empty">
        <p>해당 날짜에 예약된 내역이 없습니다.</p>
      </div>

      <!-- 예약 가능 -->
      <div v-if="dayData.available.length" class="section">
        <h4>예약 가능</h4>
        <div v-for="r in dayData.available" :key="r.id" class="card available">
          <div class="card-main">
            <div class="left">
              <span class="room-name">{{ r.roomName }}</span>
              <span class="tag available">예약 가능</span>
            </div>
            <div class="info">
              <span>🕒 {{ r.startTime }} ~ {{ r.endTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 예약 완료 -->
      <div v-if="dayData.reserved.length" class="section">
        <h4>예약 완료</h4>
        <div
          v-for="r in dayData.reserved"
          :key="r.id"
          class="card reserved"
          @click="openModal(r)" >
          <div class="card-main">
            <div class="left">
              <span class="room-name">{{ r.roomName }}</span>
              <span class="tag reserved">예약 완료</span>
            </div>
            <div class="info">
              <span>🕒 {{ r.startTime }} ~ {{ r.endTime }}</span>
              <span>👤 {{ r.reservedMember }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 예약 오픈 예정 -->
      <div v-if="dayData.pending.length" class="section">
        <h4>예약 오픈 예정</h4>
        <div v-for="r in dayData.pending" :key="r.id" class="card pending">
          <div class="card-main">
            <div class="left">
              <span class="room-name">{{ r.roomName }}</span>
              <span class="tag pending">오픈 예정</span>
            </div>
            <div class="info">
              <span>🕒 {{ r.startTime }} ~ {{ r.endTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 예약 상세 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ modalData.roomName }}</h3>
        <p class="modal-sub">🕒 {{ modalData.startTime }} ~ {{ modalData.endTime }}</p>
        <p class="modal-sub">👤 예약자: {{ modalData.reservedMember }}</p>

        <div v-if="modalData.imageUrl" class="modal-image">
          <img :src="modalData.imageUrl" alt="인증 사진" />
        </div>
        <p v-else class="no-image">인증 사진이 등록되지 않았습니다.</p>

        <div class="modal-actions">
          <button class="cancel-btn" @click="cancel(modalData)">예약 취소</button>
          <button class="close-btn" @click="closeModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import axios from "@/api/axios"
import { getWeeklyReservations, getDailyReservations, cancelReservation } from "@/api/reservationApi"

const route = useRoute()
const organizationId = Number(route.params.organizationId)

function formatDate(date) { return date.toISOString().slice(0, 10) }
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

const today = new Date()
const selectedDate = ref(formatDate(today))
const viewMode = ref("week")
const weekDays = ref(getWeekRange(today))
const weeklyData = ref([])
const dayData = ref({ available: [], reserved: [], pending: [] })

// 모달 관련
const showModal = ref(false)
const modalData = ref({})

async function loadReservationPhoto(reservationId) {
  try {
    const res = await axios.get(
      `/organizations/${organizationId}/reservations/${reservationId}/photo`
    )
    return res.data
  } catch (err) {
    console.error("인증사진 조회 실패:", err)
    return null
  }
}

// 모달 열 때 인증사진 불러오는 로직 추가
async function openModal(r) {
  showModal.value = true;
  modalData.value = r;

  try {
    if (!r.reservationId) {
      modalData.value.imageUrl = null;
      return;
    }

    // 이미지 조회 요청
    const { data: imageUrl } = await axios.get(
      `/organizations/${organizationId}/reservations/${r.reservationId}/photo`
    );

    modalData.value.imageUrl = imageUrl;
  } catch (err) {
    console.error("이미지 조회 실패:", err);
    modalData.value.imageUrl = null;
  }
}

function closeModal() {
  showModal.value = false
}

// API
async function fetchWeekly() {
  try {
    const { data } = await getWeeklyReservations(organizationId, weekDays.value[0], weekDays.value[6])
    weeklyData.value = data.reduce((acc, cur) => {
      let room = acc.find(r => r.roomId === cur.roomId)
      if (!room) {
        room = { roomId: cur.roomId, roomName: cur.roomName, schedule: {} }
        acc.push(room)
      }
      if (!room.schedule[cur.date]) room.schedule[cur.date] = []
      room.schedule[cur.date].push({
        id: `${cur.roomId}-${cur.date}-${cur.startTime}`,
        time: `${cur.startTime}~${cur.endTime}`,
        status: cur.status
      })
      return acc
    }, [])
  } catch (err) { console.error("주간 예약 조회 실패:", err) }
}

async function fetchDaily() {
  try {
    const { data } = await getDailyReservations(organizationId, selectedDate.value)
    const available = [], reserved = [], pending = []

    data.forEach(r => {
      const item = {
        id: `${r.roomId}-${r.date}-${r.startTime}`,
        reservationId: r.reservationId,
        roomId: r.roomId,
        roomName: r.roomName,
        date: r.date,
        startTime: r.startTime,
        endTime: r.endTime,
        reservedMember: r.reservedMember || "-",
        imageUrl: r.imageUrl || null,
        status: r.status
      }
      if (r.status === "AVAILABLE") available.push(item)
      else if (r.status === "RESERVED") reserved.push(item)
      else if (r.status === "OPENING_SOON") pending.push(item)
    })

    dayData.value = { available, reserved, pending }
  } catch (err) {
    console.error("일별 예약 조회 실패:", err)
  }
}

// 날짜 이동 / 토글 동일 (생략하지 않고 그대로 유지)
async function prev() {
  const target = new Date(selectedDate.value)
  target.setDate(target.getDate() - (viewMode.value === "week" ? 7 : 1))
  selectedDate.value = formatDate(target)
  weekDays.value = getWeekRange(target)
  await refreshView()
}

async function next() {
  const target = new Date(selectedDate.value)
  target.setDate(target.getDate() + (viewMode.value === "week" ? 7 : 1))
  selectedDate.value = formatDate(target)
  weekDays.value = getWeekRange(target)
  await refreshView()
}

async function onDateChange() {
  weekDays.value = getWeekRange(new Date(selectedDate.value))
  await refreshView()
}

async function refreshView() {
  if (viewMode.value === "week") await fetchWeekly()
  else await fetchDaily()
}

async function toggleView() {
  viewMode.value = viewMode.value === "week" ? "day" : "week"
  await refreshView()
}

// 예약 취소 동일
async function cancel(r) {
  if (!confirm(`[${r.roomName}] 예약을 정말 취소하시겠습니까?`)) return
  try {
    await cancelReservation(organizationId, r.roomId, r.reservationId)
    alert("예약이 취소되었습니다.")
    closeModal()
    await fetchDaily()
  } catch (err) {
    console.error("예약 취소 실패:", err)
    alert("예약 취소 중 오류 발생")
  }
}

function statusClass(status) {
  return {
    RESERVED: "status reserved",
    AVAILABLE: "status available",
    OPENING_SOON: "status pending"
  }[status]
}

onMounted(fetchWeekly)
</script>

<style scoped>
/* 전체 구조 */
.reservation-page { padding: 40px 5%; background-color: #fff; min-height: 100vh; border-radius: 16px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);}

/* 헤더 */
.header h2 { font-size: 22px; font-weight: 700; color: #001f5c; margin-bottom: 10px;}
.header p { color: #555; font-size: 14px; }

/* 상단 */
.top-bar { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 15px; flex-wrap: wrap; gap: 12px; }
.left-controls { display: flex; align-items: center; gap: 8px; }
.date-picker { border: 1px solid #ccc; border-radius: 6px; padding: 5px 10px; font-size: 14px; cursor: pointer; }
.toggle-btn { background: none; border: 1px solid #002b87; border-radius: 6px; color: #002b87; font-weight: 600; padding: 6px 12px; cursor: pointer; }

/* 주별 보기 */
.legend { font-size: 13px; color: #555; display: flex; gap: 10px; margin: 15px 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 3px; }
.green { background: #1bb978; } .red { background: #e44b4b; } .gray { background: #999; }

.table-wrapper.scrollable { max-height: 70vh; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; }
.reservation-table { width: 100%; border-collapse: collapse; text-align: center; border: 1px solid #ddd; min-width: 600px;}
.reservation-table th, .reservation-table td { border: 1px solid #ddd; padding: 8px; }
.status.available { color: #1bb978; } .status.reserved { color: #e44b4b; } .status.pending { color: #999; }
.reservation-table thead th.sticky-top { position: sticky; top: 0; background: #f9fafc; z-index: 2; }
.reservation-table td.sticky-col, .reservation-table th.sticky-col { position: sticky; left: 0; background: #fff; z-index: 3; box-shadow: 2px 0 3px rgba(0,0,0,0.05); }

/* 일별 보기 */
.day-view { margin-top: 20px; }
.date-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 25px; }
.date-title { font-size: 20px; font-weight: 700; color: #0B174E; }
.summary { display: flex; gap: 16px; font-size: 14px; font-weight: 600; }
.count { padding: 6px 12px; border-radius: 20px; background: #f8f9fa; }
.count.available { background-color: #e7f6ef; color: #1bb978; } 
.count.reserved { background-color: #fdeaea; color: #e44b4b; } 
.count.pending { background-color: #f3f3f3; color: #777; }

.section { margin-top: 35px; }
.section h4 {
  font-size: 16px;   
  color: #475467;    
  margin-bottom: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card { 
  border: 1px solid #e5e7eb; 
  border-radius: 12px; 
  padding: 18px 20px; 
  margin-bottom: 12px; 
  cursor: pointer; 
  transition: all 0.2s ease;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card:hover { 
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card.reserved:hover {
  border-color: #fca5a5;
}

.card.available {
  cursor: default;
}

.card.available:hover {
  transform: none;
}

.card-main { 
  display: flex; 
  flex-direction: column;
  gap: 12px; 
}

.left { 
  display: flex; 
  align-items: center; 
  gap: 12px;
}

.room-name { 
  font-weight: 700; 
  font-size: 16px;
  color: #1f2937;
}

.tag { 
  font-size: 12px; 
  border-radius: 16px; 
  padding: 4px 12px;
  font-weight: 600;
  white-space: nowrap;
}

.tag.available { 
  background-color: #d1fae5; 
  color: #059669; 
  border: 1px solid #6ee7b7;
}

.tag.reserved { 
  background-color: #fee2e2; 
  color: #dc2626; 
  border: 1px solid #fca5a5;
}

.tag.pending { 
  background-color: #f3f4f6; 
  color: #6b7280; 
  border: 1px solid #d1d5db;
}

.info { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
  flex-wrap: wrap; 
  font-size: 14px; 
  color: #6b7280;
  font-weight: 500;
}

.info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty { 
  text-align: center; 
  color: #9ca3af; 
  margin-top: 60px; 
  font-size: 15px;
  padding: 40px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}
/* 모달 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal { background: white; padding: 25px; border-radius: 10px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.modal h3 { font-size: 20px; font-weight: 700; margin-bottom: 6px; color: #002b87; }
.modal-sub { color: #555; font-size: 14px; margin: 3px 0; }
.modal-image img {
  max-width: 280px;  
  max-height: 280px;
  object-fit: cover; 
  border-radius: 8px;
  margin: 15px auto;
  display: block;
}
.no-image { color: #999; margin: 15px 0; }
.modal-actions { display: flex; justify-content: space-between; margin-top: 15px; gap: 10px; }
.cancel-btn { background-color: #fff; border: 1px solid #e44b4b; color: #e44b4b; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.cancel-btn:hover { background-color: #fdeaea; }
.close-btn { background-color: #002b87; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.close-btn:hover { background-color: #001f5c; }

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.nav-btn:hover {
  background-color: #f2f4f7;
}

.nav-btn:active {
  transform: scale(0.92);
  background-color: #e5e7eb;
}

.material-icons {
  font-size: 20px;
  color: #344054;
}
</style>
