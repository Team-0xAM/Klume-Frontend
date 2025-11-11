<template>
  <div class="org-dashboard">
    <h2>{{ org.name }} 대시보드</h2>

    <!-- 상단 요약 -->
    <div class="summary-grid">
      <div class="card">
        <h3>구성원</h3>
        <p>{{ org.memberCount }}명</p>
      </div>
      <div class="card">
        <h3>회의실</h3>
        <p>{{ org.roomCount }}개</p>
      </div>
      <div class="card">
        <h3>내 역할</h3>
        <p>{{ org.role }}</p>
      </div>
    </div>

    <!-- 오늘 예약 현황 -->
    <section class="today-section">
      <h3>📅 오늘의 예약 현황</h3>
      <div v-if="todayReservations.length" class="reservations">
        <div v-for="r in todayReservations" :key="r.id" class="reservation-card">
          <div>
            <strong>{{ r.room }}</strong> ({{ r.time }})
          </div>
          <div class="participants">
            {{ r.user }} 외 {{ r.participants }}명
          </div>
          <div :class="r.status" class="status">{{ r.statusText }}</div>
        </div>
      </div>
      <p v-else>오늘 예정된 예약이 없습니다.</p>
    </section>

    <!-- 공지사항 -->
    <section class="notice-section">
      <h3>📢 공지사항</h3>
      <ul>
        <li v-for="n in notices" :key="n.id">
          <a href="#" @click.prevent="goNotice(n.id)">{{ n.title }}</a>
          <span class="date">{{ n.date }}</span>
        </li>
      </ul>
    </section>

    <!-- 내 최근 예약 -->
    <section class="my-section">
      <h3>🕒 나의 최근 예약</h3>
      <div v-if="myReservations.length" class="my-list">
        <div v-for="m in myReservations" :key="m.id" class="my-item">
          <strong>{{ m.room }}</strong>
          <span>{{ m.date }} {{ m.time }}</span>
        </div>
      </div>
      <p v-else>최근 이용 내역이 없습니다.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const org = ref({
  name: '한화 BEYOND SW캠프',
  memberCount: 42,
  roomCount: 7,
  role: '일반 구성원',
})

const todayReservations = ref([])
const notices = ref([])
const myReservations = ref([])

onMounted(() => {
  loadDummyData()
})

function loadDummyData() {
  todayReservations.value = [
    {
      id: 1,
      room: '3층 회의실',
      time: '13:00~14:00',
      user: '19기 정유진',
      participants: 2,
      status: 'ongoing',
      statusText: '진행 중',
    },
    {
      id: 2,
      room: '4층 회의실',
      time: '18:00~20:00',
      user: '18기 김민지',
      participants: 3,
      status: 'upcoming',
      statusText: '이용 예정',
    },
  ]

  notices.value = [
    { id: 1, title: '[공지] 5층 회의실 리모델링 안내', date: '2025-11-09' },
    { id: 2, title: '[공지] 전원 점검으로 11/12 예약 제한', date: '2025-11-08' },
  ]

  myReservations.value = [
    { id: 10, room: '5층 테이블2', date: '2025-11-05', time: '18:00~20:00' },
    { id: 11, room: '3층 회의실', date: '2025-11-03', time: '20:00~22:00' },
  ]
}

function goNotice(id) {
  alert(`공지 ${id} 상세 페이지로 이동`)
}
</script>

<style scoped>
.org-dashboard {
  flex: 1;
  padding: 40px 60px;
  background-color: #fff;
}

.summary-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.card {
  flex: 1;
  background: #f8faff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.card h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.card p {
  font-size: 22px;
  font-weight: 700;
  color: #001f5c;
}

section {
  margin-bottom: 35px;
}

.reservations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reservation-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.status {
  font-size: 13px;
  padding: 3px 8px;
  border-radius: 6px;
}

.status.ongoing {
  background: #e8f9e5;
  color: #1bb978;
}

.status.upcoming {
  background: #fff2e5;
  color: #e48b26;
}

.notice-section ul {
  list-style: none;
  padding: 0;
}

.notice-section li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 8px 0;
  font-size: 15px;
}

.notice-section a {
  color: #001f5c;
  text-decoration: none;
}

.notice-section a:hover {
  text-decoration: underline;
}

.notice-section .date {
  color: #777;
  font-size: 13px;
}

.my-list .my-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 6px 0;
}
</style>
