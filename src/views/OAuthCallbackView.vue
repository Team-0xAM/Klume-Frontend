<template>
  <div class="callback-container">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">로그인 처리 중...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { setAccessToken, setUserEmail, setProfileImage } from '@/utils/auth'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  try {
    // URL 쿼리 파라미터에서 토큰과 사용자 정보 추출
    const token = route.query.token
    const email = route.query.email
    const profileImage = route.query.profileImage

    console.log('[OAuthCallbackView] 받은 데이터:', { token, email, profileImage })

    if (token) {
      // 토큰 저장
      setAccessToken(token)

      // 이메일 저장
      if (email) {
        setUserEmail(email)
      }

      // 프로필 이미지 저장
      if (profileImage) {
        // 구글 이미지 URL은 그대로 사용
        setProfileImage(profileImage)
      }

      console.log('[OAuthCallbackView] 로그인 성공, /home으로 이동')
      // 홈 페이지로 리다이렉트
      router.push('/home')
    } else {
      // 토큰이 없으면 로그인 페이지로
      console.error('[OAuthCallbackView] 토큰 없음, /auth/login으로 이동')
      router.push('/auth/login')
    }
  } catch (error) {
    console.error('[OAuthCallbackView] 에러 발생:', error)
    router.push('/auth/login')
  }
})
</script>

<style scoped>
.callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: #f5f6fa;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #e6e8f0;
  border-top: 4px solid #0c1c54;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #0c1c54;
  font-family: 'Noto Sans KR', sans-serif;
}
</style>
