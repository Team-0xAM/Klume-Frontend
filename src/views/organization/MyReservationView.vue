<template>
  <div class="reservation-container">
    <h2 class="title">내 예약 내역</h2>

    <!-- 탭 버튼 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tab"
        :class="{ active: selectedTab === tab }"
        @click="selectedTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 테이블 -->
    <table class="reservation-table">
      <thead>
        <tr>
          <th>회의실</th>
          <th>날짜</th>
          <th>시간</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredReservations" :key="index">
          <td>{{ item.roomName }}</td>
          <td>{{ item.reservationDate }}</td>
          <td>{{ item.startTime }} ~ {{ item.endTime }}</td>
          <td>
            <span
              class="status"
              :class="{
                today: getStatus(item) === '오늘 이용',
                upcoming: getStatus(item) === '이용 예정',
                done: getStatus(item) === '이용 완료',
                ongoing: getStatus(item) === '이용 중',
                cancelled: getStatus(item) === '취소됨'
              }"
            >
              {{ getStatus(item) }}
            </span>
          </td>
          <td>
            <button
              v-if="getButtonText(item)"
              class="btn"
              :class="{
                enter: getButtonText(item) === '입장하기',
                cancel: getButtonText(item) === '예약 취소',
                photo: getButtonText(item) === '이용 사진 보기'
              }"
              @click="handleAction(item)"
            >
              {{ getButtonText(item) }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "@/api/axios";
import { useRoute } from 'vue-router'

const tabs = ["전체", "오늘", "예정", "지난"];
const selectedTab = ref("전체");
const reservations = ref([]);

const route = useRoute()
const organizationId = Number(route.params.organizationId)

async function fetchMyReservations() {
  try {
    const res = await api.get(`/organizations/${organizationId}/reservations/my`, {
      withCredentials: true,
    });

    if (Array.isArray(res.data)) {
      reservations.value = res.data;
    } else {
      console.error("Unexpected data format:", res.data);
    }
  } catch (err) {
    console.error("예약 데이터를 불러오지 못했습니다:", err);
  }
}

fetchMyReservations();

function toDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`);
}

function isToday(dateStr) {
  const today = new Date();
  const target = new Date(dateStr);
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

function getStatus(r) {
  const now = new Date();
  const start = toDateTime(r.reservationDate, r.startTime);
  const end = toDateTime(r.reservationDate, r.endTime);

  if (r.reservationStatus === "CANCELLED") return "취소됨";
  if (r.reservationStatus === "COMPLETED") return "이용 완료";

  if (isToday(r.reservationDate)) {
    if (end < now) return "이용 완료";
    if (start > now) return "이용 예정";
    if (start <= now && now <= end) return "오늘 이용";
  }

  if (new Date(r.reservationDate) > now) return "이용 예정";
  if (new Date(r.reservationDate) < now) return "이용 완료";

  return "이용 예정";
}

function getButtonText(r) {
  const now = new Date();
  const start = toDateTime(r.reservationDate, r.startTime);
  const end = toDateTime(r.reservationDate, r.endTime);

  const status = getStatus(r);

  if (status === "이용 완료") return "이용 사진 보기";
  if (status === "이용 예정") return "예약 취소";
  if (status === "오늘 이용" && start <= now && now <= end) return "입장하기";

  return null;
}

async function handleAction(item) {
  const action = getButtonText(item);
  console.log(item.reservationId);
  if (action === "예약 취소") {
    const confirmCancel = confirm("정말 예약을 취소하시겠습니까?");
    if (!confirmCancel) return;

    try {
      await api.put(
        `/organizations/${organizationId}/reservations/${item.reservationId}/cancel`,
        { withCredentials: true }
      );

      alert("예약이 취소되었습니다.");
      fetchMyReservations(); 
    } catch (err) {
      console.error("예약 취소 실패:", err);
      alert("예약 취소 중 오류가 발생했습니다.");
    }
  }

  if (action === "입장하기") {
    alert(`${item.roomName} 회의실에 입장합니다.`);
  }

  if (action === "이용 사진 보기") {
    alert(`${item.roomName}의 이용 사진을 확인합니다.`);
  }
}

function compareDateOnly(a, b) {
  const aDate = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bDate = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return aDate - bDate;
}

const filteredReservations = computed(() => {
  const today = new Date();

  return reservations.value.filter((r) => {
    const date = new Date(r.reservationDate);
    const diff = compareDateOnly(date, today);

    if (selectedTab.value === "전체") return true;
    if (selectedTab.value === "오늘") return diff === 0;
    if (selectedTab.value === "예정") return diff > 0;
    if (selectedTab.value === "지난") return diff < 0;

    return true;
  });
});
</script>


<style scoped>
.reservation-container {
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  font-family: "Pretendard", sans-serif;
  color: #333;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  border: 1px solid #d0d0d0;
  background: #fff;
  border-radius: 9999px;
  padding: 6px 18px;
  cursor: pointer;
  font-weight: 500;
  color: #444;
  transition: 0.2s;
}

.tab:hover {
  background-color: #f5f5f5;
}

.tab.active {
  background-color: #0b2f75;
  color: #fff;
  border-color: #0b2f75;
}

.reservation-table {
  width: 100%;
  border-collapse: collapse;
}

.reservation-table th {
  background-color: #f8f8f8;
  padding: 12px;
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.reservation-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.status {
  padding: 5px 10px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
}

.status.today {
  background-color: #e3f8ed;
  color: #1b9251;
}

.status.upcoming {
  background-color: #e9e7fc;
  color: #5d4ae1;
}

.status.done {
  background-color: #fdecec;
  color: #d12e2e;
}

.status.ongoing {
  background-color: #fff3d1;
  color: #a36a00;
}

.status.cancelled {
  background-color: #eeeeee;
  color: #888;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn.enter {
  background-color: #f5d042;
  color: #1a1a1a;
}

.btn.cancel {
  background-color: #0c1c54;
  color: white;
}

.btn.photo {
  border: 1px solid #0c1c54;
  background: white;
  color: #0c1c54;
}
</style>
