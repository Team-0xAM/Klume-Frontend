<template>
  <div class="modal-overlay">
    <div class="modal-box">

      <!-- 상단 제목 -->
      <div class="modal-header">
        <h2>이용 가능 시간 등록</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-content">

        <!-- 이름 -->
        <div class="form-group">
          <label>이름</label>
          <input v-model="form.name" placeholder="시간 구분을 위한 이름을 입력해주세요" />
        </div>

        <!-- 이용 시간 -->
        <div class="form-group">
          <label>이용 시간 설정</label>
          <div class="time-row">
            <input type="time" v-model="form.startTime" />
            <span>~</span>
            <input type="time" v-model="form.endTime" />
          </div>
        </div>

        <!-- 시간 간격 설정 -->
        <div class="form-group">
          <label>시간 간격 설정 <span class="sub-text">* 시간 간격 설정 시 여러 시간대가 자동으로 생성됩니다.</span></label>
          <div class="radio-group">
            <label><input type="radio" value="none" v-model="form.interval" /> 없음</label>
            <label><input type="radio" value="30" v-model="form.interval" /> 30분</label>
            <label><input type="radio" value="60" v-model="form.interval" /> 1시간</label>
          </div>
        </div>

        <!-- 기간 / 반복 -->
        <div class="form-group">
          <label>기간 및 반복 설정</label>

          <div class="radio-group">
            <label><input type="radio" value="repeat" v-model="repeatType" /> 반복 설정</label>
            <label><input type="radio" value="single" v-model="repeatType" /> 하루</label>
          </div>

          <!-- 반복 -->
          <div v-if="repeatType === 'repeat'">
            <div class="repeat-date-group">
              <input type="date" v-model="form.repeatStart" />
              <span>~</span>
              <input type="date" v-model="form.repeatEnd" />
            </div>

            <div class="weekday-buttons">
              <button
                v-for="day in days"
                :key="day.value"
                :class="{ active: form.repeatDays.includes(day.value) }"
                @click="toggleDay(day.value)"
              >
                {{ day.label }}
              </button>
            </div>
          </div>

          <!-- 하루 -->
          <div v-if="repeatType === 'single'">
            <input type="date" v-model="form.singleDate" />
          </div>
        </div>

        <!-- 예약 오픈 설정 -->
        <div class="form-group">
          <label>예약 오픈 설정</label>
          <div class="flex">
            <input type="number" v-model="form.openDaysBefore" placeholder="며칠 전" />
            <input type="time" v-model="form.openTime" />
          </div>
        </div>

      </div>

      <!-- 버튼 -->
      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">이전</button>
        <button class="submit-btn" @click="submit">이용 가능 시간 추가하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['close', 'save'])

const repeatType = ref('repeat')

const form = ref({
  name: '',
  startTime: '',
  endTime: '',
  interval: 'none',
  repeatStart: '',
  repeatEnd: '',
  repeatDays: [],
  singleDate: '',
  openDaysBefore: '',
  openTime: ''
})

const days = [
  { label: '월', value: 'MON' },
  { label: '화', value: 'TUE' },
  { label: '수', value: 'WED' },
  { label: '목', value: 'THU' },
  { label: '금', value: 'FRI' },
  { label: '토', value: 'SAT' },
  { label: '일', value: 'SUN' }
]

function toggleDay(day) {
  form.value.repeatDays.includes(day)
    ? (form.value.repeatDays = form.value.repeatDays.filter(d => d !== day))
    : form.value.repeatDays.push(day)
}

function submit() {
  // 필수값 체크
  if (!form.value.name) return alert("이름을 입력해주세요.")
  if (!form.value.startTime || !form.value.endTime)
    return alert("이용 시작/종료 시간을 입력해주세요.")

  if (repeatType.value === 'repeat') {
    if (!form.value.repeatStart || !form.value.repeatEnd)
      return alert("반복 기간을 선택해주세요.")
  } else {
    if (!form.value.singleDate)
      return alert("날짜를 선택해주세요.")
  }

  // 호출 시 반복 타입 포함해서 전달
  emit('save', { ...form.value, repeatType: repeatType.value })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.35);
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

.modal {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #002b87;
  margin-bottom: 30px;
}

odal h2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: #002b87;
}

.modal h2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.form-group { margin-bottom: 22px; }

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #222;
}

input, textarea, select {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  box-sizing: border-box;
}

.required { color: red; }

input {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
}

.time-row {
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

.sub-text {
  color: #d9534f; /* 붉은 안내 문구 */
  font-weight: 400;
  font-size: 12px;
  margin-left: 6px;
}

/* 반복기간 input 필드 동일 너비 적용 */
.repeat-date-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.repeat-date-group input[type="date"] {
  width: 230px;
  flex-shrink: 0;
}

/* 기존 .flex 를 반복기간에서만 개선하도록 분리 */
.flex {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 요일 버튼 */
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
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  transition: 0.2s;
}

.weekday-buttons button.active {
  background: #002b87;
  color: white;
  border-color: #002b87;
}

.form-group .flex input:first-child {
  width: 140px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  gap: 10px;
}

/* 버튼 영역 */
.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 22px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.cancel-btn {
  background-color: #e5e5e5;
  color: #333;
}

.submit-btn {
  background-color: #002b87;
  color: #fff;
}

.submit-btn:hover { background-color: #0044cc; }
</style>