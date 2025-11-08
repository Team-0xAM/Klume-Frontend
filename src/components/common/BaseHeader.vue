<template>
  <header class="header">
    <!-- 로고 영역 -->
    <div class="logo" @click="goHome">
      <span class="logo-text">K<span class="logo-umlaut">LÜ</span>ME</span>
    </div>

    <!-- 오른쪽 영역 -->
    <div class="right-section">
      <!-- 로그인 안 된 상태 -->
      <button v-if="!isLoggedIn" class="login-btn" @click="goLogin">
        로그인
      </button>

      <!-- 로그인 된 상태 -->
      <div v-else class="user-email">
        {{ userEmail }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)
const userEmail = ref('')

// ✅ 예시용 토큰/이메일 확인 로직
onMounted(() => {
  const token = localStorage.getItem('accessToken')
  const email = localStorage.getItem('userEmail')

  if (token && email) {
    isLoggedIn.value = true
    userEmail.value = email
  }
})

// 라우팅 이동 함수
const goLogin = () => {
  router.push('/auth/login')
}

const goHome = () => {
  router.push('/')
}
</script>

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
  cursor: pointer;
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

.user-email {
  font-size: 16px;
  font-weight: 500;
  color: #0c1c54;
}
</style>
