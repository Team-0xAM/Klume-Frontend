<template>
    <div class="room-detail-page">
    <!-- <Sidebar /> -->

    <div class="content">

        <button class="back-btn" @click="goBack">
            ← 목록으로 돌아가기
        </button>

        <h2>회의실 자세히 보기</h2>

        <div class="detail-card">
            <img :src="room.imageUrl" class="room-image" />

        <div class="info">
            <div class="info-header">
                <h3>{{ room.name }}</h3>
                <div class="btn-group">
                <button class="edit-btn" @click="showRoomEditModal  = true">수정하기</button>
                <button class="delete-btn" @click="deleteRoomConfirm">삭제</button>
                </div>
            </div>

        <p><strong>수용 가능 인원</strong> {{ room.capacity }}명</p>
        <p><strong>설명</strong> {{ room.description || '-' }}</p>
    </div>
        </div>

        <div class="time-header">
            <h3>이용 가능 시간</h3>
            <div class="time-actions">
            <span>총 <span class="count">{{ availableTimes.length }}</span>개</span>
            <button class="add-btn" @click="showAddModal = true">추가하기</button>
            </div>
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
            @save="saveAvailableTime" />

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
import AddAvailableTimeModal from "@/components/room/AddAvailableTimeModal.vue"
import { getRoomDetail, deleteRoom, createAvailableTime, getAvailableTimes, updateAvailableTime, deleteAvailableTime } from "@/api/room/roomApi.js"
import { useRoute } from "vue-router"
import EditRoomModal from "@/components/room/EditRoomModal.vue"
import EditAvailableTimeModal from '@/components/room/EditAvailableTimeModal.vue'
import { useRouter } from "vue-router"

const route = useRoute()
const organizationId = Number(route.params.organizationId)
const roomId = Number(route.params.roomId)
const router = useRouter()
const room = ref({})
const availableTimes = ref([])

const showEditTimeModal = ref(false)

const showAddModal = ref(false)

const showRoomEditModal = ref(false)

const showTimeEditModal = ref(false)
const selectedTime = ref(null)

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

    // 예: "1일전 00:00" → ["1일전", "00:00"] 또는 "00:00" (0일전인 경우)
    const parts = openTime.split(" ")

    if (parts.length === 2) {
        const dayPart = parts[0]
        const timePart = parts[1]

        // "0일전"인 경우 "당일"로 표시
        if (dayPart === "0일전") {
            return `당일 ${timePart}`
        }

        const formattedDayPart = dayPart.replace("일전", "일 전")
        // 00:00 이면 시간 표시 안 함
        return timePart === "00:00" ? formattedDayPart : `${formattedDayPart} ${timePart}`
    }

    // "일전"이 없는 경우 (0일전으로 저장되었을 때)
    if (openTime.includes(":") && !openTime.includes("일전")) {
        return `당일 ${openTime}`
    }

    return openTime
}

function formatRepeatDays(days) {
    if (!days || days.length === 0 || days === "-") return "-"

    const map = { MON:"월", TUE:"화", WED:"수", THU:"목", FRI:"금", SAT:"토", SUN:"일" }
    return days.map(d => map[d]).join(", ")
}

function openTimeEditModal(time) {
    selectedTime.value = { ...time }
    showTimeEditModal.value = true
}

function goBack() {
    router.push(`/organization/${organizationId}/admin/rooms`)
}

async function deleteRoomConfirm() {
    if (!confirm("정말 이 회의실을 삭제하시겠습니까?\n이미 예약이 있는 경우 삭제할 수 없습니다.")) return

    try {
        await deleteRoom(organizationId, roomId)

        alert("회의실이 삭제되었습니다.")
        router.push(`/organization/${organizationId}/admin/rooms`)

    } catch (err) {
        console.error(err)
        alert("삭제 실패: 이미 예약이 존재하거나 권한이 없습니다.")
    }
}


async function fetchRoomDetail() {
    const { data } = await getRoomDetail(organizationId, roomId)
    room.value = data
}

async function fetchAvailableTimes() {
    try {
        const { data } = await getAvailableTimes(organizationId, roomId)

        availableTimes.value = data.map(t => ({
        id: t.id,
        name: t.name,

        // 시간 변환
        startTime: t.availableStartTime,
        endTime: t.availableEndTime,

        // 시간 간격
        interval: t.timeInterval ? String(t.timeInterval) : "-",

        // 예약 오픈 표시
        openTime: (t.reservationOpenDay !== null && t.reservationOpenDay !== undefined) && t.reservationOpenTime
        ? `${t.reservationOpenDay}일전 ${t.reservationOpenTime}`
        : "상시",

    // 반복 요일
    repeatDays: [
    t.mon && "MON",
    t.tue && "TUE",
    t.wed && "WED",
    t.thu && "THU",
    t.fri && "FRI",
    t.sat && "SAT",
    t.sun && "SUN",
    ].filter(Boolean),

      // 반복 기간
        repeatStart: t.repeatStartDay,
        repeatEnd: t.repeatEndDay,
        }))
        availableTimes.value.sort((a, b) => {
            const toMs = v => (v ? new Date(v).getTime() : Infinity)
            return toMs(a.repeatStart) - toMs(b.repeatStart)
    })
    } catch (err) {
        console.error("이용 가능 시간 조회 실패:", err)
    }
}

async function updateTime(form) {
    if (!form.id) { alert("수정 대상 ID가 없습니다."); return }
    if (!form.name || !form.startTime || !form.endTime) {
    alert("이름/시작/종료 시간을 입력해주세요."); return
    }

    const repeatDate = form.repeatType === "repeat"
    ? { start: form.repeatStart, end: form.repeatEnd }
    : { start: form.singleDate, end: form.singleDate }

    const payload = {
    name: form.name,
    mon: form.repeatDays.includes("MON"),
    tue: form.repeatDays.includes("TUE"),
    wed: form.repeatDays.includes("WED"),
    thu: form.repeatDays.includes("THU"),
    fri: form.repeatDays.includes("FRI"),
    sat: form.repeatDays.includes("SAT"),
    sun: form.repeatDays.includes("SUN"),

    availableStartTime: form.startTime,
    availableEndTime: form.endTime,

    reservationOpenDay: form.openDaysBefore !== "" && form.openDaysBefore !== null && form.openDaysBefore !== undefined ? Number(form.openDaysBefore) : null,
    reservationOpenTime: form.openTime || null,

    repeatStartDay: form.repeatType === "repeat" ? form.repeatStart : form.singleDate,
    repeatEndDay: form.repeatType === "repeat" ? form.repeatEnd : form.singleDate,

    timeInterval: form.interval === "none" ? null : Number(form.interval),
    }

    try {
    await updateAvailableTime(organizationId, roomId, form.id, payload)
    await fetchAvailableTimes()
    showTimeEditModal.value = false
    } catch (e) {
    console.error(e)
    alert("수정 실패: 입력을 다시 확인해주세요.")
    }
}

async function deleteTime(id) {
    if (!confirm("정말 삭제하시겠습니까?\n해당 시간에 예약이 존재하면 삭제할 수 없습니다.")) return

    try {
        await deleteAvailableTime(organizationId, roomId, id)
        await fetchAvailableTimes()
        alert("삭제되었습니다.")
    } catch (err) {
        console.error(err)
        alert("삭제 실패: 이미 예약이 존재하거나 권한이 없습니다.")
    }
}

async function saveAvailableTime(form) {

    const payload = {
    name: form.name,

    // 요일 배열 → boolean 변환
    mon: form.repeatDays.includes("MON"),
    tue: form.repeatDays.includes("TUE"),
    wed: form.repeatDays.includes("WED"),
    thu: form.repeatDays.includes("THU"),
    fri: form.repeatDays.includes("FRI"),
    sat: form.repeatDays.includes("SAT"),
    sun: form.repeatDays.includes("SUN"),

    // 이용시간
    availableStartTime: form.startTime,
    availableEndTime: form.endTime,

    // 예약 오픈 설정 (값 없으면 null, 0은 유효한 값)
    reservationOpenDay: form.openDaysBefore !== "" && form.openDaysBefore !== null && form.openDaysBefore !== undefined ? Number(form.openDaysBefore) : null,
    reservationOpenTime: form.openTime || null,

    // 반복/하루 처리 (빈 문자열 → null)
    repeatStartDay: form.repeatType === "repeat"
        ? form.repeatStart
        : form.singleDate,

    repeatEndDay: form.repeatType === "repeat"
        ? form.repeatEnd
        : form.singleDate,

    // 시간 간격
    timeInterval: form.interval === "none" ? null : Number(form.interval)
    }

    console.log("등록 payload:", payload)

    try {
        await createAvailableTime(organizationId, roomId, payload)
        await fetchAvailableTimes()
        showAddModal.value = false
    } catch (err) {
        console.error(err)
        alert("등록 실패: 입력값을 다시 확인해주세요.")
    }
}


onMounted(async () => {
    await fetchRoomDetail()
    await fetchAvailableTimes() })
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
    margin-top:20px;
    align-items: flex-start;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.info { flex: 1; }

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.btn-group {
    display: flex;
    gap: 16px;
}

.info-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #222;
    margin: 0;
}

.room-image {
    width: 250px;
    height: 200px;
    object-fit: cover;
    margin-right: 24px;
}

.info p { margin-bottom: 10px; }

.edit-btn,
.delete-btn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
}

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

.btn-group { display: flex; gap: 6px; }

.delete-btn {
    padding: 6px 12px;
    border: 1px solid #d9534f;
    background: #fff;
    color: #d9534f;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
}
.delete-btn:hover {
    background: #d9534f;
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
    font-size: 16px;
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

.time-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.time-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
}

.time-actions span.count {
    color: #f9c802;
    font-weight: 700;
    margin: 0;
}

.back-btn {
    margin-bottom: 20px;
    padding: 6px 14px;
    background: #fff;
    border: 1px solid #002b87;
    color: #002b87;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
}

.back-btn:hover {
    background: #002b87;
    color: #fff;
}

</style>
