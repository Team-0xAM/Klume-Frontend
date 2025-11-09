<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isAuthenticated, getUserEmail, getProfileImage, logout } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)
const userEmail = ref('')
const profileImage = ref('')
const showLogoutModal = ref(false)
const imageError = ref(false)

// 로그인 상태 확인 함수
const checkAuthStatus = () => {
  const authenticated = isAuthenticated()
  const email = getUserEmail()
  const image = getProfileImage()

  isLoggedIn.value = authenticated
  userEmail.value = email || ''
  profileImage.value = image || ''
  imageError.value = false // 이미지 에러 상태 초기화
}

// 컴포넌트 마운트 시 체크
onMounted(() => {
  checkAuthStatus()
})

// 라우트 변경 시 체크 (로그인/로그아웃 후 자동 업데이트)
watch(() => route.path, () => {
  checkAuthStatus()
}, { immediate: true })

// localStorage 변경 감지 (같은 탭에서 로그인 시)
watch(() => [isAuthenticated(), getUserEmail(), getProfileImage()], () => {
  checkAuthStatus()
})

// storage 이벤트 감지 (다른 탭에서 로그인/로그아웃 시)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', checkAuthStatus)

  // 페이지 포커스 시에도 체크 (다른 탭에서 로그인한 경우)
  window.addEventListener('focus', checkAuthStatus)
}

// 라우팅 이동 함수
const goLogin = () => {
  router.push('/auth/login')
}

const goHome = () => {
  router.push('/')
}

// 이메일에서 첫 글자 추출
const getInitial = (email) => {
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
}

// 이미지 로딩 에러 처리
const handleImageError = () => {
  imageError.value = true
}

// 로그아웃 처리
const handleLogout = () => {
  logout()
  showLogoutModal.value = false
  router.push('/home')
}
</script>

<template>
  <header class="header">
    <!-- 로고 영역 -->
    <div class="logo" @click="goHome">
      <span class="logo-text">KL<span class="logo-umlaut">Ü</span>ME</span>
    </div>

    <!-- 오른쪽 영역 -->
    <div class="right-section">
      <!-- 로그인 안 된 상태 -->
      <button v-if="!isLoggedIn" class="login-btn" @click="goLogin">
        로그인
      </button>

      <!-- 로그인 된 상태 -->
      <div v-else class="user-info" @click="showLogoutModal = true">
        <div class="profile-image">
          <img
            v-if="profileImage && !imageError"
            :src="profileImage"
            alt="프로필"
            class="profile-img"
            @error="handleImageError"
          />
          <span v-else class="profile-initial">{{ getInitial(userEmail) }}</span>
        </div>
        <span class="user-email">{{ userEmail }}</span>
      </div>
    </div>

    <!-- 로그아웃 모달 -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">로그아웃</h3>
        <p class="modal-message">정말 로그아웃하시겠습니까?</p>
        <div class="modal-buttons">
          <button class="modal-btn cancel-btn" @click="showLogoutModal = false">취소</button>
          <button class="modal-btn logout-btn" @click="handleLogout">로그아웃</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  background-color: #ffffff;
  border-bottom: 1px solid #e6e8f0;
  font-family: 'Noto Sans KR', sans-serif;
}

.logo {
  cursor: pointer !important;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #0c1c54;
}

.logo-umlaut {
  color: #f5c843;
}

.right-section {
  display: flex;
  align-items: center;
}

.login-btn {
  border: none;
  background: none;
  color: #0c1c54;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.2s ease;
}

.login-btn:hover {
  color: #f5c843;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-info:hover {
  background-color: #f5f6fa;
}

.profile-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0c1c54 0%, #15266b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(12, 28, 84, 0.15);
}

.profile-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.profile-initial {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  user-select: none;
}

.user-email {
  font-size: 15px;
  font-weight: 500;
  color: #0c1c54;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px 40px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 16px;
  text-align: center;
}

.modal-message {
  font-size: 15px;
  color: #555;
  text-align: center;
  margin-bottom: 24px;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}

.logout-btn {
  background-color: #0c1c54;
  color: #ffffff;
}

.logout-btn:hover {
  background-color: #15266b;
}
</style>
