<template>
  <div class="reservation-page">
    <h1 class="page-title">예약하기</h1>

    <div class="header-section">
      <!-- 회의실 선택 -->
      <div class="room-selector">
        <label for="roomSelect">회의실 선택</label>
        <select id="roomSelect" v-model="selectedRoomId" @change="fetchReservations">
          <option value="" disabled>회의실을 선택하세요</option>
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
      </div>

      <!-- 날짜 선택 -->
      <div class="date-selector">
        <button class="date-btn" @click="showCalendar = !showCalendar">
          <span class="calendar-icon">📅</span>
          <span class="selected-date">{{ formatSelectedDate }}</span>
        </button>

        <!-- 캘린더 모달 -->
        <div v-if="showCalendar" class="calendar-modal" @click.self="showCalendar = false">
          <div class="calendar-content">
            <div class="calendar-header">
              <button @click="prevMonth">&lt;</button>
              <span>{{ currentMonth }}</span>
              <button @click="nextMonth">&gt;</button>
            </div>
            <div class="calendar-body">
              <div class="weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
              </div>
              <div class="dates">
                <div
                  v-for="date in calendarDates"
                  :key="date.dateString"
                  class="date-cell"
                  :class="{
                    'other-month': date.isOtherMonth,
                    'selected': date.dateString === selectedDate,
                    'today': date.isToday
                  }"
                  @click="selectDate(date)"
                >
                  {{ date.day }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 회의실 정보 -->
    <div class="room-info" v-if="selectedRoomData">
      <div class="room-image">
        <img :src="selectedRoomData.imageUrl" :alt="selectedRoomData.name" />
      </div>
      <div class="room-details">
        <div class="info-row">
          <span class="label">회의실 이름</span>
          <span class="value">{{ selectedRoomData.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">수용 가능 인원</span>
          <span class="value">{{ selectedRoomData.capacity }}명</span>
        </div>
        <div class="info-row">
          <span class="label">설명</span>
          <span class="value">{{ selectedRoomData.description }}</span>
        </div>
      </div>
    </div>

    <!-- 예약 가능 시간 -->
    <h3 class="page-title">예약 가능 시간</h3>
    <div v-if="selectedRoomData && reservations.length > 0" class="time-section">
      
      <table class="reservation-table">
        <thead>
          <tr>
            <th>No</th>
            <th>이름</th>
            <th>이용 시간</th>
            <th>예약상태</th>
            <th>오픈</th>
            <th>예약하기</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reservations" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.timeName }}</td>
            <td class="time-cell">{{ item.startTime }} - {{ item.endTime }}</td>
            <td>
              <span 
                class="status-badge"
                :class="{
                  'reserved': getStatusText(item) === '예약 됨',
                  'opening': getStatusText(item) === '오픈 예정',
                  'available': getStatusText(item) === '예약 가능'
                }"
              >
                {{ getStatusText(item) }}
              </span>
              <div v-if="item.status === 'RESERVED' && item.reservedMember" class="reserved-info">
              </div>
            </td>
            <td class="open-time-cell">
              <div v-if="item.status === 'OPENING_SOON'">
                <div v-if="isOpeningSoon(item)" class="countdown">
                  {{ getCountdown(item) }} 후<br/>오픈 예정
                </div>
                <div v-else>
                  {{ formatOpenTime(item) }}
                </div>
              </div>
              <div v-else-if="item.status === 'AVAILABLE'">
                상시
              </div>
              <div v-else>
                {{ formatOpenTime(item) }}
              </div>
            </td>
            <td>
              <button 
                v-if="item.status === 'AVAILABLE' && !isTimePassed(item)"
                class="reserve-btn available"
                @click="handleReserve(item)"
              >
                예약하기
              </button>
              <button 
                v-else-if="item.status === 'AVAILABLE' && isTimePassed(item)"
                class="reserve-btn closed"
                disabled
              >
                시간 마감
              </button>
              <button 
                v-else-if="item.status === 'OPENING_SOON'"
                class="reserve-btn opening"
                disabled
              >
                오픈 예정
              </button>
              <button 
                v-else
                class="reserve-btn reserved"
                disabled
              >
                예약 불가
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="selectedRoomData && reservations.length === 0" class="no-data">
      선택한 날짜에 예약 가능한 시간이 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getRooms } from '@/api/room/roomApi'
import { createReservation, getAvailableTimes } from '@/api/reservation/reservationApi'

const route = useRoute()
const organizationId = Number(route.params.organizationId || 0)
const rooms = ref([])
const selectedRoomId = ref('')
const selectedDate = ref('')
const showCalendar = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonthIndex = ref(new Date().getMonth())
const reservations = ref([])
const currentTime = ref(new Date())

let countdownInterval = null

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

// 선택된 회의실 데이터
const selectedRoomData = computed(() =>
  rooms.value.find((room) => room.id === Number(selectedRoomId.value))
)

// 회의실 목록 호출
const fetchMeetingRooms = async () => {
  try {
    const res = await getRooms(organizationId)
    if (Array.isArray(res.data)) {
      rooms.value = res.data
      if (res.data.length > 0) {
        selectedRoomId.value = res.data[0].id
        await fetchReservations()
      }
    } else {
      console.error('Unexpected data format:', res.data)
    }
  } catch (err) {
    console.error('회의실 데이터를 불러오지 못했습니다:', err)
  }
}

// 예약 현황 조회
async function fetchReservations() {
  if (!selectedRoomId.value || !selectedDate.value) return
  
  try {
    const res = await getAvailableTimes(organizationId, selectedDate.value)
    
    if (Array.isArray(res.data)) {
      reservations.value = res.data.filter(
        item => item.roomId === Number(selectedRoomId.value)
      )
    } else {
      console.error('Unexpected data format:', res.data)
      reservations.value = []
    }
  } catch (err) {
    console.error('예약 현황을 불러오지 못했습니다:', err)
    reservations.value = []
  }
}

// 예약하기
async function handleReserve(item) {
  const confirmReserve = confirm(
    `${item.timeName} (${item.startTime} - ${item.endTime})을 예약하시겠습니까?`
  )
  
  if (!confirmReserve) return
  
  try {
    await createReservation(
      organizationId,
      item.roomId,
      item.dailyAvailableTimeId
    )
    
    alert('예약이 완료되었습니다.')
    
    await fetchReservations()
  } catch (err) {
    console.error('예약 실패:', err)
    
    if (err.response?.data?.message) {
      alert(`예약 실패: ${err.response.data.message}`)
    } else {
      alert('예약 중 오류가 발생했습니다.')
    }
  }
}

function initializeDate() {
  const today = new Date()
  selectedDate.value = formatDateString(today)
}

function formatDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 선택된 날짜 표시 형식
const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return '날짜 선택'
  const date = new Date(selectedDate.value)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} (${weekday})`
})

const currentMonth = computed(() => {
  return `${currentYear.value}년 ${currentMonthIndex.value + 1}월`
})

const calendarDates = computed(() => {
  const year = currentYear.value
  const month = currentMonthIndex.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)
  
  const dates = []
  const today = formatDateString(new Date())
  
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDay.getDate() - i
    const dateObj = new Date(year, month - 1, day)
    dates.push({
      day,
      dateString: formatDateString(dateObj),
      isOtherMonth: true,
      isToday: false
    })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateObj = new Date(year, month, i)
    const dateString = formatDateString(dateObj)
    dates.push({
      day: i,
      dateString,
      isOtherMonth: false,
      isToday: dateString === today
    })
  }
 
  const remainingDays = 42 - dates.length
  for (let i = 1; i <= remainingDays; i++) {
    const dateObj = new Date(year, month + 1, i)
    dates.push({
      day: i,
      dateString: formatDateString(dateObj),
      isOtherMonth: true,
      isToday: false
    })
  }
  
  return dates
})

function prevMonth() {
  if (currentMonthIndex.value === 0) {
    currentMonthIndex.value = 11
    currentYear.value--
  } else {
    currentMonthIndex.value--
  }
}

function nextMonth() {
  if (currentMonthIndex.value === 11) {
    currentMonthIndex.value = 0
    currentYear.value++
  } else {
    currentMonthIndex.value++
  }
}

function selectDate(date) {
  if (date.isOtherMonth) return
  selectedDate.value = date.dateString
  showCalendar.value = false
  fetchReservations()
}

// 상태 텍스트 변환
function getStatusText(item) {
  const statusMap = {
    'RESERVED': '예약 됨',
    'OPENING_SOON': '오픈 예정',
    'AVAILABLE': '예약 가능'
  }
  return statusMap[item.status] || item.status
}

// 오픈 시간 포맷 (11.09 09:00)
function formatOpenTime(item) {
  if (!item.reservationOpenDay || !item.reservationOpenTime) return '-'
  
  const openDate = new Date(selectedDate.value)
  openDate.setDate(openDate.getDate() - item.reservationOpenDay)
  
  const month = String(openDate.getMonth() + 1).padStart(2, '0')
  const day = String(openDate.getDate()).padStart(2, '0')
  
  return `${month}.${day} ${item.reservationOpenTime}`
}

// 1시간 이내 오픈 예정인지 확인
function isOpeningSoon(item) {
  if (!item.reservationOpenDay || !item.reservationOpenTime) return false
  
  const openDate = new Date(selectedDate.value)
  openDate.setDate(openDate.getDate() - item.reservationOpenDay)
  
  const [hours, minutes] = item.reservationOpenTime.split(':')
  openDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  const diff = openDate.getTime() - currentTime.value.getTime()
  return diff > 0 && diff <= 3600000
}

// 카운트다운 계산
function getCountdown(item) {
  if (!item.reservationOpenDay || !item.reservationOpenTime) return ''
  
  const openDate = new Date(selectedDate.value)
  openDate.setDate(openDate.getDate() - item.reservationOpenDay)
  
  const [hours, minutes] = item.reservationOpenTime.split(':')
  openDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  const diff = openDate.getTime() - currentTime.value.getTime()
  
  if (diff <= 0) return '곧 오픈'
  
  const totalMinutes = Math.floor(diff / 60000)
  const displayHours = Math.floor(totalMinutes / 60)
  const displayMinutes = totalMinutes % 60
  
  if (displayHours > 0) {
    return `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}`
  }
  return `${String(displayMinutes).padStart(2, '0')}:00`
}

// 시간이 지났는지 확인
function isTimePassed(item) {
  if (!item.endTime) return false
  
  const today = new Date()
  const selectedDateObj = new Date(selectedDate.value)
  
  // 선택된 날짜가 오늘이 아니면 false
  if (selectedDateObj.toDateString() !== today.toDateString()) {
    return selectedDateObj < today
  }
  
  const [hours, minutes] = item.endTime.split(':')
  const endDateTime = new Date(selectedDate.value)
  endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  return currentTime.value >= endDateTime
}

function startCountdown() {
  countdownInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
}

onMounted(() => {
  initializeDate()
  fetchMeetingRooms()
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.reservation-page {
  flex: 1;
  padding: 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 30px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

.room-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-selector label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
}

.room-selector select {
  padding: 10px 16px;
  border: 2px solid #1e3a8a;
  border-radius: 8px;
  font-size: 15px;
  min-width: 200px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.room-selector select:focus {
  outline: none;
  border-color: #1e3a8a;
}

/* 날짜 선택 */
.date-selector {
  position: relative;
}

.date-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #1e3a8a;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1e3a8a;
  cursor: pointer;
  transition: all 0.2s;
}

.date-btn:hover {
  background: #f0f7ff;
}

.calendar-icon {
  font-size: 20px;
}

.selected-date {
  min-width: 180px;
  text-align: left;
}

/* 캘린더 모달 */
.calendar-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.calendar-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 350px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.calendar-header button:hover {
  background: #f0f0f0;
}

.calendar-header span {
  font-size: 18px;
  font-weight: 600;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 8px;
  font-size: 14px;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 14px;
}

.date-cell:not(.other-month):hover {
  background: #f0f7ff;
}

.date-cell.other-month {
  color: #ccc;
  cursor: default;
}

.date-cell.selected {
  background: #1e3a8a;
  color: white;
  font-weight: 600;
}

.date-cell.today {
  border: 2px solid #1e3a8a;
  font-weight: 600;
}

.room-info {
  display: flex;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  align-items: center; 
  justify-content: center;
}

.room-image {
  width: 250px;
  height: 200px;
  border-radius: 1px;
  overflow: hidden;
  flex-shrink: 0;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 20px;
}

.info-row .label {
  font-weight: 600;
  color: #1e3a8a;
  min-width: 120px;
}

.info-row .value {
  color: #1a1a1a;
  flex: 1;
}

/* 예약 시간 섹션 */
.time-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

/* 예약 테이블 */
.reservation-table {
  width: 100%;
  border-collapse: collapse;
}

.reservation-table th {
  background: #f8f9fa;
  padding: 14px 12px;
  text-align: center;
  font-weight: 600;
  color: #1a1a1a;
  border-bottom: 2px solid #e0e0e0;
  font-size: 15px;
}

.reservation-table td {
  padding: 16px 12px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.time-cell {
  font-weight: 500;
  color: #1a1a1a;
}

/* 상태 뱃지 */
.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.reserved {
  background: #fee;
  color: #d32f2f;
}

.status-badge.opening {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.available {
  background: #e8f5e9;
  color: #2e7d32;
}

.reserved-info {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
}

/* 오픈 시간 */
.open-time-cell {
  font-size: 14px;
  color: #666;
}

.countdown {
  font-weight: 600;
  color: #f57c00;
  font-size: 15px;
  line-height: 1.4;
}

/* 예약 버튼 */
.reserve-btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.reserve-btn.available {
  background: #1e3a8a;
  color: white;
}

.reserve-btn.available:hover {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
}

.reserve-btn.opening,
.reserve-btn.reserved,
.reserve-btn.closed {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

/* 데이터 없음 */
.no-data {
  background: white;
  padding: 60px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  color: #999;
  font-size: 16px;
}
</style>