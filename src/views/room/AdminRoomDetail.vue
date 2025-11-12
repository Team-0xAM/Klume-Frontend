<template>
    <div class="room-detail-page">
    <!-- <Sidebar /> -->

    <div class="content">
        <h2>회의실 자세히 보기</h2>

        <div class="detail-card">
            <img :src="room.imageUrl || defaultImage" class="room-image" />

        <div class="info">
            <div class="info-header">
                <h3>{{ room.name }}</h3>
                <button class="edit-btn" @click="showRoomEditModal  = true">수정하기</button>
            </div>

        <p><strong>수용 가능 인원</strong> {{ room.capacity }}명</p>
        <p><strong>설명</strong> {{ room.description || '-' }}</p>
    </div>
        </div>

        <div class="time-header">
            <h3>이용 가능 시간</h3>
            <span>총 {{ availableTimes.length }}개</span>
            <button class="add-btn" @click="showAddModal = true">추가하기</button>
        </div>

        <table class="time-table">
            <thead>
            <tr>
                <th>No</th>
                <th>이름</th>
                <th>이용 시간</th>
                <th>간격</th>
                <th>예약 오픈</th>
                <th>반복요일</th>
                <th>반복 기간</th>
                <th></th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="(t, idx) in availableTimes" :key="t.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ t.name }}</td>
                <td>{{ t.startTime }} - {{ t.endTime }}</td>
                <td>{{ formatInterval(t.interval) }}</td>
                <td>{{ formatOpenTime(t.openTime) }}</td>
                <td>{{ formatRepeatDays(t.repeatDays) }}</td>
                <td>{{ formatPeriod(t.repeatStart, t.repeatEnd) }}</td>
                <td>
                    <button class="small-btn" @click="openTimeEditModal(t)">수정</button>
                    <button class="small-btn danger" @click="deleteTime(t.id)">삭제</button>
                </td>
            </tr>
            </tbody>
        </table>

        <AddAvailableTimeModal
            v-if="showAddModal"
            @close="showAddModal = false"
            @save="fetchAvailableTimes" />

        <EditAvailableTimeModal
            v-if="showTimeEditModal"
            :time="selectedTime"
            @close="showTimeEditModal  = false"
            @save="updateTime" />
    </div>
    </div>

    <EditRoomModal
    v-if="showRoomEditModal"
    :name="room.name"
    :description="room.description"
    :capacity="room.capacity"
    @close="showRoomEditModal  = false"
    @save="fetchRoomDetail" />
</template>

<script setup>
import { ref, onMounted } from "vue"
// import Sidebar from "@/components/layout/Sidebar.vue"
import AddAvailableTimeModal from "@/components/room/AddAvailableTimeModal.vue"
import { getRoomDetail } from "@/api/room/roomApi.js"
import { useRoute } from "vue-router"
import EditRoomModal from "@/components/room/EditRoomModal.vue"
import defaultImage from "@/assets/images/default-room.png"
import EditAvailableTimeModal from '@/components/room/EditAvailableTimeModal.vue'

const route = useRoute()
const organizationId = Number(route.params.organizationId)
const roomId = Number(route.params.roomId)

const room = ref({})
const availableTimes = ref([])

const showEditTimeModal = ref(false)

const showAddModal = ref(false)

// 회의실 수정 모달
const showRoomEditModal = ref(false)

// 이용 가능 시간 수정 모달
const showTimeEditModal = ref(false)
const selectedTime = ref(null)

const dayMap = {
    MON: "월",
    TUE: "화",
    WED: "수",
    THU: "목",
    FRI: "금",
    SAT: "토",
    SUN: "일",
}


function formatPeriod(start, end) {
    if (!start && !end) return '-'
    return `${start.replace(/-/g, '.')} - ${end.replace(/-/g, '.')}`
}

function formatInterval(interval) {
    if (!interval || interval === "none" || interval === "-") return "-"
    if (interval === "30") return "30분"
    if (interval === "60") return "1시간"
    return interval
}

function formatOpenTime(openTime) {
    if (!openTime || openTime === "-") return "-"

    if (openTime === "상시") return "상시"

    // 예: "1일전 00:00" → ["1일전", "00:00"]
    const parts = openTime.split(" ")

    if (parts.length === 2) {
        const dayPart = parts[0].replace("일전", "일 전")
        const timePart = parts[1]
        // 00:00 이면 시간 표시 안 함
        return timePart === "00:00" ? dayPart : `${dayPart} ${timePart}`
    }
    return openTime
}

function formatRepeatDays(days) {
    if (!days || days.length === 0 || days === "-") return "-"

    const map = { MON:"월", TUE:"화", WED:"수", THU:"목", FRI:"금", SAT:"토", SUN:"일" }
    return days.map(d => map[d]).join(", ")
}

function openEditTimeModal(time) {
    selectedTime.value = { ...time } // 수정 모달에서 바뀌어도 원본 영향 X
    showEditTimeModal.value = true
}

function openTimeEditModal(time) {
  selectedTime.value = { ...time }
  showTimeEditModal.value = true
}

async function fetchRoomDetail() {
    const { data } = await getRoomDetail(organizationId, roomId)
    room.value = data
}

async function fetchAvailableTimes() {
  // TODO: 백엔드 연동 후 수정
    availableTimes.value = [
        { id: 1, name: "점심 타임", startTime: "13:00", endTime: "14:00", openTime: "상시" },
        { id: 2, name: "저녁 1타임", startTime: "18:00", endTime: "20:00", openTime: "1일전 00:00" },
    ]
}

async function deleteTime(timeId) {
    if (!confirm("정말 삭제하시겠습니까?")) return

    await deleteAvailableTime(organizationId, roomId, timeId)
    await fetchAvailableTimes()
}

onMounted(async () => {
    await fetchRoomDetail()
    await fetchAvailableTimes()
})
</script>

<style scoped>
.room-detail-page { display: flex; min-height: 100vh; background: #f5f6fa; }
.content { flex: 1; padding: 40px 60px; }

/* 상세 카드 */
.detail-card {
    display: flex;
    background: #fff;
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 30px;
    align-items: flex-start;
}

.info {
    flex: 1;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.info-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #222;
    margin: 0;
}

.room-image {
    width: 280px;
    height: 180px;
    border-radius: 8px;
    object-fit: cover;
    margin-right: 24px;
}

.info p { margin-bottom: 10px; }

.edit-btn {
    padding: 6px 12px;
    border: 1px solid #002b87;
    background: #fff;
    color: #002b87;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
}

.edit-btn:hover {
    background: #002b87;
    color: #fff;
}

/* 이용 가능 시간 테이블 */
.time-header {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}

.add-btn {
    padding: 6px 12px;
    border: 1px solid #002b87;
    background: #fff;
    color: #002b87;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
}

.add-btn:hover {
    background: #002b87;
    color: #fff;
}

/* 이용 가능 시간 테이블 */
.time-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    font-size: 14px;
}

/* 헤더 */
.time-table thead {
    background: #f8f9fb;
    border-bottom: 1px solid #e1e4eb;
}

.time-table th {
    padding: 14px 10px;
    text-align: center;
    font-weight: 600;
    color: #333;
    text-align: center;

}

/* 바디 */
.time-table td {
    padding: 14px 10px;
    border-bottom: 1px solid #eee;
    color: #444;
    text-align: center;

}

/* 행 Hover 효과 */
.time-table tbody tr:hover {
    background: #f6f9ff;
}

/* 작은 버튼 (수정 / 삭제) */
.small-btn {
    padding: 4px 10px;
    font-size: 13px;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid #002b87;
    background: #fff;
    color: #002b87;
    transition: 0.2s;
    margin-right: 4px;
}

.small-btn:hover {
    background: #002b87;
    color: #fff;
}

/* 삭제 버튼 (빨간 Outline 스타일) */
.small-btn.danger {
    border-color: #d9534f;
    color: #d9534f;
    background: #fff;
}

.small-btn.danger:hover {
    background: #d9534f;
    color: #fff;
}

</style>
