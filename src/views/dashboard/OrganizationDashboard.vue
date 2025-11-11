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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchOrganizationInfo, organizationRole, organizationName } from '@/composables/useOrganization.js'
import { getNotices } from '@/api/notice'
import api from '@/api/axios'

const route = useRoute()
const router = useRouter()
const organizationId = ref(parseInt(route.params.organizationId))

const org = ref({
  name: organizationName.value || '조직',
  memberCount: 0,
  roomCount: 0,
  role: '로딩 중...',
})

const todayReservations = ref([])
const notices = ref([])
const myReservations = ref([])
const isLoading = ref(true)

// 역할 한글 변환
const roleText = computed(() => {
  if (organizationRole.value === 'ADMIN') return '관리자'
  if (organizationRole.value === 'MEMBER') return '일반 구성원'
  return '로딩 중...'
})

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
  isLoading.value = true

  try {
    // 1. 조직 정보 로드
    await fetchOrganizationInfo(organizationId.value)
    org.value.name = organizationName.value
    org.value.role = roleText.value

    // 2. 공지사항 로드 (최근 2개만)
    try {
      const noticeRes = await getNotices(organizationId.value)
      const noticeData = Array.isArray(noticeRes.data) ? noticeRes.data : []
      notices.value = noticeData.slice(0, 2).map(n => ({
        id: n.noticeId || n.id,
        title: n.title,
        date: n.createdAt ? n.createdAt.split(' ')[0] : ''
      }))
    } catch (err) {
      console.error('공지사항 로드 실패:', err)
      notices.value = []
    }

    // 3. 조직 통계 로드 (구성원 수, 회의실 수)
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const statsRes = await api.get(`/organizations/${organizationId.value}/stats`)
      // org.value.memberCount = statsRes.data.memberCount
      // org.value.roomCount = statsRes.data.roomCount

      // 임시: 더미 데이터 사용
      org.value.memberCount = 42
      org.value.roomCount = 7
    } catch (err) {
      console.error('통계 로드 실패:', err)
    }

    // 4. 오늘 예약 현황 로드
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const todayRes = await api.get(`/organizations/${organizationId.value}/reservations/today`)
      // todayReservations.value = todayRes.data

      // 임시: 더미 데이터
      todayReservations.value = []
    } catch (err) {
      console.error('오늘 예약 로드 실패:', err)
      todayReservations.value = []
    }

    // 5. 내 최근 예약 로드
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const myRes = await api.get(`/organizations/${organizationId.value}/reservations/my`)
      // myReservations.value = myRes.data

      // 임시: 더미 데이터
      myReservations.value = []
    } catch (err) {
      console.error('내 예약 로드 실패:', err)
      myReservations.value = []
    }

  } catch (error) {
    console.error('대시보드 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
}

function goNotice(id) {
  router.push(`/organization/${organizationId.value}/notice/${id}`)
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
