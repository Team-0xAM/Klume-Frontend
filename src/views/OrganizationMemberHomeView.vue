<template>
    <div class="dashboard">
        <!-- 오늘 내 예약 -->
        <section class="section today">
            <div class="section-header">
                <h3>오늘 내 예약</h3>
                <button class="text-btn" @click="goToMyReservations">더보기</button>
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

                <div class="controls">
                    <div class="date-select">
                        <label>날짜 선택</label>
                        <input type="date" v-model="selectedDate" class="date-input" />
                    </div>
                    <div class="room-select">
                        <label for="roomSelect">회의실 선택</label>
                        <select id="roomSelect" v-model="selectedRoom">
                            <option v-for="room in roomOptions" :key="room" :value="room">
                                {{ room }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <table class="table small">
                <thead>
                    <tr>
                        <th>이용 가능일</th>
                        <th>이용시간</th>
                        <th>오픈 시각</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, i) in filteredOpenSlots" :key="i">
                        <td>{{ formatDate(item.date) }}</td>
                        <td>
                            {{ item.availableStartTime }} ~ {{ item.availableEndTime }}
                        </td>
                        <td>{{ item.reservationOpenTime }}</td>
                        <td>
                            <span class="status" :class="{
                                upcoming: isReservationOpen(item.reservationOpenDay, item.reservationOpenTime),
                                closed: !isReservationOpen(item.reservationOpenDay, item.reservationOpenTime),
                            }">
                                {{ isReservationOpen(item.reservationOpenDay, item.reservationOpenTime) ? "오픈예정" : "마감" }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="!filteredOpenSlots.length">
                        <td colspan="4" class="empty-text">
                            해당 회의실의 예약 가능 정보가 없습니다
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- 회의실 공지사항 -->
        <section class="section">
            <div class="section-header">
                <h3>회의실 공지사항</h3>
                <button class="text-btn" @click="goToNotices">공지 더보기</button>
            </div>

            <ul class="notice-list" v-if="notices.length">
                <li v-for="(item, i) in notices" :key="i" class="notice-item" @click="goToNoticeDetail(item.id)">
                    <span class="notice-title">{{ item.title }}</span>
                    <span class="notice-date">{{ item.date }}</span>
                </li>
            </ul>
            <p v-else class="empty-text">등록된 공지사항이 없습니다</p>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { getNotices } from '@/api/notice'

const route = useRoute()
const router = useRouter()
const organizationId = ref(Number(route.params.organizationId))

// 날짜 선택 (기본값: 오늘)
const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
const selectedDate = ref(getTodayString())

// 회의실 선택
const selectedRoom = ref("");
const roomOptions = ref([]);

// 일자별 예약 가능 시간 데이터
const dailyAvailableTimes = ref([]);

// 선택한 회의실 + 선택한 날짜에 예약 오픈되는 것만 필터링
const filteredOpenSlots = computed(() => {
    return dailyAvailableTimes.value.filter(
        (slot) => slot.roomName === selectedRoom.value && slot.reservationOpenDay === selectedDate.value
    )
});

// 회의실 목록과 예약 가능 시간 조회
const fetchRoomsAndAvailableTimes = async () => {
    try {
        // 1. 회의실 목록 조회 (모든 회의실)
        const roomsRes = await api.get(`/organizations/${organizationId.value}/rooms`)
        const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : []

        // 회의실 이름 목록 생성
        roomOptions.value = rooms.map(room => room.name)
        selectedRoom.value = roomOptions.value[0] || ""

        // 2. 오늘 이후 이용 가능한 일자별 예약 가능 시간 조회
        const timesRes = await api.get(`/organizations/${organizationId.value}/daily-available-times/today`)
        const times = Array.isArray(timesRes.data) ? timesRes.data : []

        // 데이터 매핑
        dailyAvailableTimes.value = times.map(time => ({
            roomName: time.room_name,
            availableStartTime: time.available_start_time,
            availableEndTime: time.available_end_time,
            date: time.date, // 이용 가능일
            reservationOpenDay: time.reservation_open_day, // 예약 오픈일 (YYYY-MM-DD)
            reservationOpenTime: time.reservation_open_time
        }))
    } catch (err) {
        console.error("회의실 예약 가능 시간 조회 실패:", err)
        dailyAvailableTimes.value = []
        // 회의실 목록은 유지 (에러가 나도 회의실 선택은 가능하도록)
    }
};

// 날짜 포맷 함수
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

// 예약 오픈 상태 판별 (오늘 날짜 + 오픈 시각 기준)
const isReservationOpen = (openDay, openTime) => {
    if (!openDay || !openTime) return false;

    const now = new Date();
    const [hours, minutes] = openTime.split(':');
    const openDateTime = new Date(openDay);
    openDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // 현재 시간이 오픈 시간보다 이전이면 오픈예정
    return now < openDateTime;
};

// 오늘 내 예약
const myReservations = ref([]);

// 오늘 내 예약 조회
const fetchMyTodayReservations = async () => {
    try {
        const res = await api.get(`/organizations/${organizationId.value}/reservations/my/today`)
        const data = Array.isArray(res.data) ? res.data : []
        myReservations.value = data.map(item => ({
            room: item.roomName || '회의실',
            time: `${item.startTime || ''} ~ ${item.endTime || ''}`,
            status: item.status === 'CONFIRMED' ? '예약완료' : '대기중',
            date: item.date ? new Date(item.date).toLocaleDateString('ko-KR') : ''
        }))
    } catch (err) {
        console.error('오늘 내 예약 조회 실패:', err)
        myReservations.value = []
    }
}

// 공지사항
const notices = ref([]);

// 공지사항 조회 (최근 3개)
const fetchNotices = async () => {
    try {
        const res = await getNotices(organizationId.value)
        const data = Array.isArray(res.data) ? res.data : []
        notices.value = data.slice(0, 3).map(notice => ({
            id: notice.noticeId || notice.id,
            title: notice.title,
            date: notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('ko-KR') : ''
        }))
    } catch (err) {
        console.error('공지사항 조회 실패:', err)
        notices.value = []
    }
}

// 내 예약 페이지로 이동
const goToMyReservations = () => {
    router.push({
        name: 'MyReservationPage',
        params: { organizationId: organizationId.value }
    })
}

// 공지사항 목록 페이지로 이동
const goToNotices = () => {
    router.push({
        name: 'NoticePage',
        params: { organizationId: organizationId.value }
    })
}

// 공지사항 상세 페이지로 이동
const goToNoticeDetail = (noticeId) => {
    router.push({
        name: 'NoticeDetail',
        params: {
            organizationId: organizationId.value,
            noticeId: noticeId
        }
    })
}

onMounted(async () => {
    await fetchRoomsAndAvailableTimes();
    await fetchMyTodayReservations();
    await fetchNotices();
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

/* 회의실 선택 및 날짜 선택 */
.controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.date-select {
    display: flex;
    align-items: center;
    gap: 10px;
}

.date-select label {
    font-weight: 600;
    color: #222;
}

.date-input {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    font-family: "Noto Sans KR", sans-serif;
}

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
    padding: 10px 8px;
    border-top: 1px solid #eee;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.notice-item:first-child {
    border-top: none;
}

.notice-item:hover {
    background-color: #f8f9fa;
}

.notice-title {
    color: #333;
    font-weight: 500;
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
