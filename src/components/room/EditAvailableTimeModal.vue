<template>
  <div class="modal-overlay">
    <div class="modal-box">

      <!-- 상단 -->
      <div class="modal-header">
        <h2>이용 가능 시간 수정</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-content">

        <!-- 이름 -->
        <div class="form-group">
          <label>이름</label>
          <input v-model="localTime.name" placeholder="시간 구분 이름을 입력해주세요" />
        </div>

        <!-- 이용 시간 -->
        <div class="form-group">
          <label>이용 시간 설정</label>
          <div class="time-row">
            <input type="time" v-model="localTime.startTime" />
            <span>~</span>
            <input type="time" v-model="localTime.endTime" />
          </div>
        </div>

        <!-- 시간 간격 -->
        <div class="form-group">
          <label>시간 간격 설정</label>
          <div class="radio-group">
            <label><input type="radio" value="none" v-model="localTime.interval" /> 없음</label>
            <label><input type="radio" value="30" v-model="localTime.interval" /> 30분</label>
            <label><input type="radio" value="60" v-model="localTime.interval" /> 1시간</label>
          </div>
        </div>

        <!-- 반복 -->
        <div class="form-group">
          <label>기간 및 반복 설정</label>

          <div class="radio-group">
            <label><input type="radio" value="repeat" v-model="localTime.repeatType" /> 반복 설정</label>
            <label><input type="radio" value="single" v-model="localTime.repeatType" /> 하루</label>
          </div>

          <!-- 반복 -->
          <div v-if="localTime.repeatType === 'repeat'">
            <div class="repeat-date-group">
              <input type="date" v-model="localTime.repeatStart" />
              <span>~</span>
              <input type="date" v-model="localTime.repeatEnd" />
            </div>

            <div class="weekday-buttons">
              <button
                v-for="day in days"
                :key="day.value"
                :class="{ active: localTime.repeatDays.includes(day.value) }"
                @click="toggleDay(day.value)"
              >{{ day.label }}</button>
            </div>
          </div>

          <!-- 하루 -->
          <div v-if="localTime.repeatType === 'single'">
            <input type="date" v-model="localTime.singleDate" />
          </div>
        </div>

        <!-- 예약 오픈 -->
        <div class="form-group">
          <label>예약 오픈 설정</label>
          <div class="flex">
            <input type="number" v-model="localTime.openDaysBefore" placeholder="며칠 전" />
            <input type="time" v-model="localTime.openTime" />
          </div>
        </div>

      </div>

      <!-- 버튼 -->
      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">취소</button>
        <button class="submit-btn" @click="save">저장</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ time: Object })
const emit = defineEmits(['close', 'save'])

const localTime = ref({})

const days = [
  { label: '월', value: 'MON' },
  { label: '화', value: 'TUE' },
  { label: '수', value: 'WED' },
  { label: '목', value: 'THU' },
  { label: '금', value: 'FRI' },
  { label: '토', value: 'SAT' },
  { label: '일', value: 'SUN' }
]

watch(() => props.time, (t) => {
  if (!t) return

  localTime.value = {
    id: t.id,
    name: t.name,
    startTime: t.startTime,
    endTime: t.endTime,
    interval: t.interval === "-" ? "none" : t.interval,

    repeatStart: t.repeatStart || "",
    repeatEnd: t.repeatEnd || "",
    repeatDays: Array.isArray(t.repeatDays) ? [...t.repeatDays] : [],

    singleDate: (!t.repeatStart || t.repeatStart === t.repeatEnd) ? t.repeatStart : "",

    // 예약 오픈 설정 파싱
    openDaysBefore: t.openTime && t.openTime.includes("일전")
      ? Number(t.openTime.split("일전")[0])
      : "",
    openTime: t.openTime && t.openTime.includes(":")
      ? t.openTime.split(" ")[1]
      : "",

    repeatType: (t.repeatStart && t.repeatEnd && t.repeatStart !== t.repeatEnd) ? "repeat" : "single"
  }
}, { immediate: true })

function toggleDay(day) {
  localTime.value.repeatDays.includes(day)
    ? (localTime.value.repeatDays = localTime.value.repeatDays.filter(d => d !== day))
    : localTime.value.repeatDays.push(day)
}

function save() {
  // 필수값 체크
  if (!localTime.value.name) return alert("이름을 입력해주세요.")
  if (!localTime.value.startTime || !localTime.value.endTime)
    return alert("이용 시작/종료 시간을 입력해주세요.")

  if (localTime.value.repeatType === "repeat") {
    if (!localTime.value.repeatStart || !localTime.value.repeatEnd)
      return alert("반복 기간을 입력해주세요.")
  } else {
    if (!localTime.value.singleDate)
      return alert("하루 예약 날짜를 선택해주세요.")
  }

  emit('save', { ...localTime.value })
  emit('close')
}
</script>

<style scoped>
/* 동일 스타일 적용 (등록 모달과 완전 통일) */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-box {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #002b87;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 22px;
}

label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

input, select {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
}

.time-row,
.flex,
.repeat-date-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 8px;
  font-size: 15px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px; 
  cursor: pointer;
  line-height: 1.4;
}

.radio-group input[type="radio"] {
  width: 16px;
  height: 16px;
}

.form-group > .radio-group {
  margin: 10px 0 14px 0;
}

.weekday-buttons {
  margin-top: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.weekday-buttons button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}

.weekday-buttons button.active {
  background: #002b87;
  color: white;
  border-color: #002b87;
}

/* 버튼 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  gap: 10px;
}

.cancel-btn, .submit-btn {
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #e5e5e5;
  color: #333;
}

.submit-btn {
  background: #002b87;
  color: white;
}

.submit-btn:hover {
  background: #0044cc;
}
</style>
