<template>
  <div class="reservation-page">
    <h2 class="title">예약하기</h2>
    <div class="header-section">
      <!-- 회의실 선택 드롭다운 -->
      <div class="room-selector">
        <label for="roomSelect">회의실 선택</label>
        <select id="roomSelect" v-model="selectedRoomId">
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

    <!-- 회의실 선택 안 됨 -->
    <div v-else class="no-selection">
      회의실을 선택하면 예약 정보를 확인할 수 있습니다.
    </div>


    <div class="time-slots" v-if="selectedRoomData">
      <p class="placeholder">시간대 선택 영역 (개발 예정)</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getRooms } from '@/api/room/roomApi'

const route = useRoute()
const organizationId = Number(route.params.organizationId || 0)
const rooms = ref([])
const selectedRoomId = ref('')
const selectedDate = ref('')
const showCalendar = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonthIndex = ref(new Date().getMonth())

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
      selectedRoomId.value = res.data[0].id
    } else {
      console.error('Unexpected data format:', res.data)
    }
  } catch (err) {
    console.error('회의실 데이터를 불러오지 못했습니다:', err)
  }
}

// 오늘 날짜로 초기화
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
 
  const remainingDays = 42 - dates.length // 6주 = 42일
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
}

onMounted(() => {
  initializeDate()
  fetchMeetingRooms()
})
</script>

<style scoped>
.reservation-page {
  flex: 1;
  padding: 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.title {
  color: #1e3a8a
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

/* 회의실 선택 */
.room-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-selector label {
  font-weight: 500;
  color: #1e3a8a;
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
  flex-shrink: 0;
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
  align-items: center;
  gap: 40px; 
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.room-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.room-image img {
  width: 250px;
  height: 200px;
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
  gap: 40px;
  margin-bottom: 15px;
}

.info-row .label {
  font-weight: 600;
  color: #0B174E;
  min-width: 120px;
}

.info-row .value {
  color: #1a1a1a;
  flex: 1;
}

.no-selection {
  background: white;
  padding: 60px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  color: #999;
  font-size: 16px;
}

/* 시간대 영역 */
.time-slots {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.placeholder {
  color: #999;
  font-size: 16px;
}
</style>