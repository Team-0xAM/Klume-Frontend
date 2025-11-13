<template>
  <div v-if="visible" class="calendar-modal" @click.self="$emit('close')">
    <div class="calendar-content">
      <div class="calendar-header">
        <button @click="$emit('prev')">&lt;</button>
        <span>{{ currentMonth }}</span>
        <button @click="$emit('next')">&gt;</button>
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
            @click="onSelect(date)"
          >
            {{ date.day }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  currentMonth: String,
  weekdays: Array,
  calendarDates: Array,
  selectedDate: String
})

const emit = defineEmits(['close', 'prev', 'next', 'select'])

function onSelect(date) {
  if (!date.isOtherMonth) emit('select', date)
}
</script>

<style scoped>
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
</style>
