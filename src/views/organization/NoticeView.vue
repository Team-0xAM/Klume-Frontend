<template>
  <div class="notice-view">
    <div class="page-header">
      <h1>공지사항</h1>
      <p class="subtitle">조직의 공지사항을 확인하세요</p>
    </div>

    <!-- 공지사항 목록 -->
    <div class="notice-list" v-if="!selectedNotice">
      <div v-if="notices.length === 0" class="empty-state">
        <p>등록된 공지사항이 없습니다</p>
      </div>

      <table v-else class="notice-table">
        <thead>
          <tr>
            <th>No</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(notice, index) in notices"
            :key="notice.noticeId"
            @click="viewNoticeDetail(notice.noticeId)"
            class="clickable-row"
          >
            <td>{{ index + 1 }}</td>
            <td class="title">{{ notice.title }}</td>
            <td>{{ notice.authorName }}</td>
            <td>{{ formatDate(notice.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 공지사항 상세 -->
    <div v-else class="notice-detail">
      <button class="back-btn" @click="selectedNotice = null">← 목록으로</button>
      <h2 class="detail-title">{{ selectedNotice.title }}</h2>
      <div class="detail-meta">
        <span>작성자: {{ selectedNotice.authorName }}</span>
        <span>작성일: {{ formatDate(selectedNotice.createdAt) }}</span>
      </div>
      <div class="detail-content" v-html="selectedNotice.content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getNotices, getNoticeById } from '@/api/notice'

const route = useRoute()
const organizationId = Number(route.params.organizationId)

const notices = ref([])
const selectedNotice = ref(null)
const loading = ref(false)

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 목록 조회
async function fetchNotices() {
  try {
    loading.value = true
    const { data } = await getNotices(organizationId)
    // 최신순으로 정렬
    notices.value = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  } catch (err) {
    console.error('공지사항 목록 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

// 상세 조회
async function viewNoticeDetail(noticeId) {
  try {
    const { data } = await getNoticeById(organizationId, noticeId)
    selectedNotice.value = data
  } catch (err) {
    console.error('공지사항 상세 조회 실패:', err)
  }
}

onMounted(fetchNotices)
</script>

<style scoped>
.notice-view {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* 헤더 */
.page-header {
  margin-bottom: 24px;
}
.page-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #222;
}
.subtitle {
  font-size: 14px;
  color: #777;
}

/* 테이블 */
.notice-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.notice-table th {
  background: #f9fafc;
  padding: 12px;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
}
.notice-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}
.notice-table td.title {
  text-align: left;
  cursor: pointer;
  color: #0056d6;
}
.notice-table td.title:hover {
  text-decoration: underline;
}
.clickable-row {
  cursor: pointer;
}

/* 상세 페이지 */
.notice-detail {
  padding: 20px;
}
.detail-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
}
.detail-meta {
  display: flex;
  justify-content: space-between;
  color: #777;
  margin-bottom: 20px;
  font-size: 14px;
}
.detail-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
}
.back-btn {
  border: none;
  background: none;
  color: #0056d6;
  cursor: pointer;
  font-size: 15px;
  margin-bottom: 10px;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
  font-size: 16px;
}
</style>
