<template>
  <div class="org-layout">
    <SideBar
      :organization-name="organizationName"
      :profile-image="organizationImage"
      :user-name="userNickname"
      :role="organizationRole"
    >
      <!-- 메인 메뉴 -->
      <template #main-menu>
        <NavButton
          label="홈"
          icon="icon_home.png"
          :to="`/organization/${organizationId}`"
        />
        <NavButton
          label="예약하기"
          icon="icon_clock.png"
          :to="`/organization/${organizationId}/reserve`"
        />
        <NavButton
          label="내 예약 보기"
          icon="icon_check.png"
          :to="`/organization/${organizationId}/my-reservations`"
        />
        <NavButton
          label="공지사항"
          icon="icon_bookmark.png"
          :to="`/organization/${organizationId}/notices`"
        />
        <NavButton
          label="조직 대시보드로 가기"
          icon="icon_grid.png"
          :to="'/organization'"
        />
      </template>

      <!-- 관리자 메뉴 -->
      <template v-if="organizationRole === 'ADMIN'" #admin-menu>
        <NavButton
          label="예약 관리"
          icon="icon_calendar.png"
          :to="`/organization/${organizationId}/admin/reservations`"
        />
        <NavButton
          label="회의실 관리"
          icon="icon_navigation.png"
          :to="`/organization/${organizationId}/admin/rooms`"
        />
        <NavButton
          label="조직 관리"
          icon="icon_users.png"
          :to="`/organization/${organizationId}/admin/organization`"
        />
        <NavButton
          label="공지사항 관리"
          icon="icon_bookmark.png"
          :to="`/organization/${organizationId}/admin/notices`"
        />
        <NavButton
          label="채팅 문의"
          icon="icon_circle.png"
          :to="`/organizations/${organizationId}/chat`"
        />
      </template>
    </SideBar>

    <div class="notice-admin-container">
      <div class="page-header">
        <h2>공지사항 관리</h2>
        <p>조직에 대한 공지사항을 등록할 수 있는 공간입니다</p>
      </div>

    <div class="table-header">
      <span>총 {{ notices.length }}개</span>
      <button class="btn-primary" @click="openModal()">글 작성</button>
    </div>

    <table class="notice-table">
      <thead>
        <tr>
          <th>No</th>
          <th>제목</th>
          <th>작성자</th>
          <th>작성일</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(notice, index) in sortedNotices" :key="notice.id">
          <td>{{ notices.length - index }}</td>
          <td>{{ notice.title }}</td>
          <td>{{ notice.authorName ? notice.authorName : '(닉네임 없음)' }}</td>
          <td>{{ formatDate(notice.createdAt) }}</td>
          <td>
            <button class="btn-small" @click="openModal(notice)">수정</button>
            <button class="btn-small danger" @click="handleDeleteNotice(notice.id)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>

    <NoticeModal
      v-if="isModalOpen"
      :notice="selectedNotice"
      @close="isModalOpen = false"
      @save="handleSave"
    />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NoticeModal from '../components/notice/NoticeModal.vue'
import SideBar from '@/components/common/SideBar.vue'
import NavButton from '@/components/common/NavButton.vue'
import { useRoute } from 'vue-router'
import { getNotices, createNotice, updateNotice, deleteNotice as deleteNoticeApi } from '../api/notice'
import { fetchOrganizationInfo, organizationRole, organizationName, organizationImage, userNickname } from '@/composables/useOrganization.js'

const route = useRoute()
const organizationId = route.params.organizationId

const notices = ref([])
const isModalOpen = ref(false)
const selectedNotice = ref(null)

// 공지 목록 불러오기
const fetchNotices = async () => {
  try {
    const res = await getNotices(organizationId)
    console.log('공지사항 응답 데이터:', res.data)
    // 백엔드에서 List를 직접 반환하므로 res.data 사용
    const noticesData = Array.isArray(res.data) ? res.data : res.data.data || []
    // noticeId를 id로 매핑
    notices.value = noticesData.map(notice => {
      console.log('개별 공지사항:', notice)
      console.log('authorName 값:', notice.authorName)
      return {
        id: notice.noticeId,
        title: notice.title,
        content: notice.content,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
        memberId: notice.memberId,
        authorName: notice.authorName || null
      }
    })
    console.log('변환된 공지사항 목록:', notices.value)
  } catch (e) {
    console.error('공지사항 목록 조회 실패:', e)
    console.error('에러 상세:', e.response?.data)
    alert('공지사항 목록을 불러오지 못했습니다.')
  }
}

// 공지 등록/수정 모달
const openModal = (notice = null) => {
  selectedNotice.value = notice ? { ...notice } : null
  isModalOpen.value = true
}

// 등록 또는 수정
const handleSave = async (formData) => {
  try {
    if (formData.id) {
      console.log('공지사항 수정:', organizationId, formData.id)
      const response = await updateNotice(organizationId, formData.id, {
        title: formData.title,
        content: formData.content
      })
      console.log('수정 응답:', response.data)
      alert('공지사항이 수정되었습니다.')
    } else {
      console.log('공지사항 생성:', organizationId)
      const response = await createNotice(organizationId, {
        title: formData.title,
        content: formData.content
      })
      console.log('생성 응답:', response.data)
      alert('공지사항이 등록되었습니다.')
    }
    isModalOpen.value = false
    fetchNotices()
  } catch (e) {
    console.error('공지사항 저장 실패:', e)
    console.error('에러 상세:', e.response?.data)
    const errorMsg = e.response?.data?.message || '저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

// 삭제
const handleDeleteNotice = async (id) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    console.log('공지사항 삭제:', organizationId, id)
    const response = await deleteNoticeApi(organizationId, id)
    console.log('삭제 응답:', response.data)
    alert('삭제되었습니다.')
    fetchNotices()
  } catch (e) {
    console.error('공지사항 삭제 실패:', e)
    console.error('에러 상세:', e.response?.data)
    const errorMsg = e.response?.data?.message || '삭제 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

// 최신순 정렬
const sortedNotices = computed(() =>
  [...notices.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split('T')[0].replace(/-/g, '.')
}

onMounted(async () => {
  await fetchOrganizationInfo(organizationId)
  fetchNotices()
})
</script>

<style scoped>
.org-layout {
  display: flex;
  min-height: 100vh;
}

.notice-admin-container {
  flex: 1;
  padding: 40px;
  background-color: #f8f9fb;
  min-height: 100vh;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #222;
}

/* ---------- 상단 헤더 ---------- */
.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1b3b8b;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 14px;
  color: #666;
}

/* ---------- 테이블 상단 (총 개수 + 버튼) ---------- */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header span {
  font-size: 15px;
  color: #555;
}

.btn-primary {
  background-color: #1b3b8b;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #162f73;
}

/* ---------- 테이블 ---------- */
.notice-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  table-layout: fixed;
}

.notice-table th,
.notice-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
  text-align: center;
  word-wrap: break-word;
  font-size: 15px;
}

/* 테이블 헤더 */
.notice-table th {
  background-color: #f1f3f5;
  font-weight: 600;
  color: #333;
}

/* 각 열 비율 */
.notice-table th:nth-child(1),
.notice-table td:nth-child(1) {
  width: 10%;
}

.notice-table th:nth-child(2),
.notice-table td:nth-child(2) {
  width: 40%;
  text-align: center;
  white-space: nowrap;           /* 줄바꿈 금지 */
  overflow: hidden;              /* 넘친 부분 숨김 */
  text-overflow: ellipsis;       /* 말줄임(...) 처리 */
}

.notice-table th:nth-child(3),
.notice-table td:nth-child(3) {
  width: 20%;
}

.notice-table th:nth-child(4),
.notice-table td:nth-child(4) {
  width: 20%;
}

.notice-table th:nth-child(5),
.notice-table td:nth-child(5) {
  width: 10%;
  white-space: nowrap; /* 버튼 줄바꿈 방지 */
}

/* ---------- 버튼 ---------- */
.btn-small {
  background: #e9ecef;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  margin: 0 3px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
  display: inline-block;
}

.btn-small:hover {
  background: #dee2e6;
}

/* 삭제 버튼 (톤 다운된 빨강) */
.btn-small.danger {
  background: #ff6b6b;
  color: #fff;
}

.btn-small.danger:hover {
  background: #fa5252;
}

</style>
