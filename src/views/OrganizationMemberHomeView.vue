<template>
    <div class="dashboard">
        <!-- 오늘 내 예약 -->
        <section class="section today">
            <div class="section-header">
                <h3>오늘 내 예약</h3>
                <button class="text-btn">더보기</button>
            </div>

            <div v-if="myReservations.length" class="reservation-list">
                <div v-for="(item, i) in myReservations" :key="i" class="reservation-card">
                    <div class="card-top">
                        <div class="room-name">{{ item.room }}</div>
                        <span class="status done">{{ item.status }}</span>
                    </div>
                    <div class="card-bottom">
                        <div class="time">{{ item.time }}</div>
                        <div class="date">{{ item.date }}</div>
                    </div>
                </div>
            </div>

            <p v-else class="empty-text">오늘은 예약된 회의실이 없습니다</p>
        </section>

        <!-- 회의실별 예약 현황 -->
        <section class="section">
            <div class="section-header between">
                <h3>회의실별 예약 현황 보기</h3>

                <div class="room-select">
                    <label for="roomSelect">회의실 선택</label>
                    <select id="roomSelect" v-model="selectedRoom">
                        <option v-for="room in roomOptions" :key="room" :value="room">
                            {{ room }}
                        </option>
                    </select>
                </div>
            </div>

            <table class="table small">
                <thead>
                    <tr>
                        <th>이용시간</th>
                        <th>예약 오픈일</th>
                        <th>오픈 시각</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, i) in filteredOpenSlots" :key="i">
                        <td>
                            {{ item.availableStartTime }} ~ {{ item.availableEndTime }}
                        </td>
                        <td>{{ formatDate(item.reservationOpenDay) }}</td>
                        <td>{{ item.reservationOpenTime }}</td>
                        <td>
                            <span class="status" :class="{
                                upcoming: isUpcoming(item.reservationOpenDay),
                                closed: !isUpcoming(item.reservationOpenDay),
                            }">
                                {{ isUpcoming(item.reservationOpenDay) ? "오픈예정" : "마감" }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="!filteredOpenSlots.length">
                        <td colspan="4" class="empty-text">
                            해당 회의실의 예약 오픈 정보가 없습니다
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- 회의실 공지사항 -->
        <section class="section">
            <div class="section-header">
                <h3>회의실 공지사항</h3>
                <button class="text-btn">공지 더보기</button>
            </div>

            <ul class="notice-list">
                <li v-for="(item, i) in notices" :key="i" class="notice-item">
                    <span class="notice-title">{{ item.title }}</span>
                    <span class="notice-date">{{ item.date }}</span>
                </li>
            </ul>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

// 회의실 선택
const selectedRoom = ref("");
const roomOptions = ref([]);

// 일자별 예약 가능 시간 데이터
const dailyAvailableTimes = ref([]);

// 선택한 회의실만 필터링
const filteredOpenSlots = computed(() =>
    dailyAvailableTimes.value.filter(
        (slot) => slot.roomName === selectedRoom.value
    )
);

// API 호출
const fetchDailyAvailableTimes = async () => {
    try {
        const res = await axios.get(
            "/api/organizations/1/daily-available-times"
        );
        dailyAvailableTimes.value = res.data;

        // 중복 제거된 회의실 목록 세팅
        roomOptions.value = [...new Set(res.data.map((item) => item.roomName))];
        selectedRoom.value = roomOptions.value[0] || "";
    } catch (err) {
        console.error("예약 가능 시간 조회 실패:", err);
    }
};

// 날짜 포맷 함수
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

// 오픈예정/마감 상태 판별
const isUpcoming = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const open = new Date(dateStr);
    return open >= today;
};

// 오늘 내 예약 (더미 데이터)
const myReservations = ref([
    {
        room: "3층 회의실",
        time: "13:00 ~ 14:00",
        status: "예약완료",
        date: "2025.11.08",
    },
    {
        room: "5층 테이블3",
        time: "18:00 ~ 20:00",
        status: "예약완료",
        date: "2025.11.07",
    },
]);

// 공지사항 (더미 데이터)
const notices = ref([
    { title: "[공지] 4층 회의실 사용 제한 안내", date: "2025.11.08" },
    { title: "[점검] 11/10 00:00~02:00 시스템 점검 안내", date: "2025.11.06" },
    { title: "[신규] 반복 예약 기간 설정 기능 추가", date: "2025.10.30" },
]);

onMounted(() => {
    fetchDailyAvailableTimes();
});
</script>

<style scoped>
.dashboard {
    padding: 40px;
    background: #f8f9fb;
    min-height: 100vh;
    font-family: "Noto Sans KR", sans-serif;
    color: #222;
}

/* 섹션 기본 */
.section {
    background: white;
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 28px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
}

.section-header.between {
    align-items: flex-end;
}

h3 {
    font-size: 17px;
    font-weight: bold;
    margin: 0;
}

/* 오늘 내 예약 */
.reservation-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
}

.reservation-card {
    background: #f9fafc;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid #e2e6ea;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.room-name {
    font-weight: 600;
    color: #1f4b8e;
}

.card-bottom {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #444;
}

.empty-text {
    text-align: center;
    color: #999;
    font-size: 14px;
    padding: 20px 0;
}

/* 회의실 선택 */
.room-select {
    display: flex;
    align-items: center;
    gap: 10px;
}

.room-select label {
    font-weight: 600;
    color: #222;
}

.room-select select {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
}

/* 테이블 */
.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.table th {
    background: #f3f4f6;
    padding: 10px;
    text-align: left;
    color: #555;
}

.table td {
    padding: 10px;
    border-top: 1px solid #eee;
}

.small th,
.small td {
    padding: 8px;
}

/* 상태 */
.status {
    padding: 3px 10px;
    border-radius: 8px;
    font-size: 13px;
}

.status.done {
    background: #e7f5ed;
    color: #1d7a41;
}

.status.upcoming {
    background: #fff4d6;
    color: #946300;
}

.status.closed {
    background: #ffe6e6;
    color: #b32626;
}

/* 공지사항 */
.notice-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.notice-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-top: 1px solid #eee;
}

.notice-item:first-child {
    border-top: none;
}

.notice-title {
    color: #333;
}

.notice-date {
    color: #888;
    font-size: 13px;
}

/* 버튼 */
.text-btn {
    background: none;
    border: none;
    color: #1f4b8e;
    font-size: 14px;
    cursor: pointer;
}

.text-btn:hover {
    text-decoration: underline;
}
</style>
