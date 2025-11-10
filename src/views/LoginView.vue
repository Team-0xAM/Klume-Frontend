<template>
  <div class="login-container">
    <!-- 왼쪽 로그인 폼 영역 -->
    <div class="login-left">
      <div class="login-card">
        <h2 class="login-title">로그인</h2>

        <!-- 이메일 입력 -->
        <div class="input-field">
          <BaseInput v-model="email" placeholder="이메일" type="email" />
        </div>

        <!-- 비밀번호 입력 -->
        <div class="input-field">
          <BaseInput v-model="password" placeholder="비밀번호" type="password" />
        </div>

        <!-- 에러 메시지 -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <!-- 로그인 버튼 -->
        <div class="button-field">
          <button
            type="button"
            class="login-btn"
            :disabled="isLoading"
            @click="handleLogin"
          >
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </div>

        <!-- 구글 로그인 -->
        <div class="button-field">
          <GoogleButton
            label="Google 계정으로 로그인"
            class="google-btn"
            @click="handleGoogleLogin"
          />
        </div>

        <!-- 회원가입 안내 -->
        <p class="signup-text">
          계정이 없으신가요?
          <span class="signup-link" @click="goSignup">회원가입하기</span>
        </p>
      </div>
    </div>

    <!-- 오른쪽 이미지 영역 -->
    <div class="login-right">
      <img
        src="@/assets/images/login_side.png"
        alt="login side"
        class="side-image"
      />
      <div class="image-overlay"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { login } from "@/api/auth"
import { setAccessToken, setUserEmail, setProfileImage } from "@/utils/auth"
import BaseInput from "@/components/common/BaseInput.vue"
import GoogleButton from "@/components/common/GoogleButton.vue"

const router = useRouter()
const email = ref("")
const password = ref("")
const errorMessage = ref("")
const isLoading = ref(false)

const handleLogin = async (event) => {

  // 명시적으로 기본 동작 방지
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // 이미 로딩 중이면 중복 실행 방지
  if (isLoading.value) {
    return
  }

  // 유효성 검사
  if (!email.value || !password.value) {
    errorMessage.value = "이메일과 비밀번호를 입력해주세요."
    setTimeout(() => {
    }, 100)
    return
  }

  errorMessage.value = ""
  isLoading.value = true

  try {
    const response = await login({
      email: email.value,
      password: password.value,
    })


    // 로그인 성공 시 토큰, 이메일, 프로필 이미지 저장
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken)
      setUserEmail(email.value)


      // 프로필 이미지가 있으면 저장
      if (response.data.profileImage) {
        // 백엔드에서 파일명만 전달하면 public 폴더 경로로 변환
        const imagePath = response.data.profileImage.startsWith('http')
          ? response.data.profileImage
          : `/${response.data.profileImage}`
        setProfileImage(imagePath)
      }

      // 로그인 성공 후 이동할 페이지 (새로고침하여 헤더 업데이트)
      window.location.href = '/home'
    }
  } catch (error) {

    if (error.response) {
      // 서버 응답이 있는 경우
      errorMessage.value = error.response.data.message || "로그인에 실패했습니다."
    } else {
      // 서버 응답이 없는 경우
      errorMessage.value = "서버에 연결할 수 없습니다."
    }
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = () => {
  window.location.href = "http://localhost:8080/oauth2/authorization/google"
}

const goSignup = () => {
  router.push("/auth/signup")
}
</script>

<style scoped>
    /* 전체 레이아웃 */
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  font-family: "Noto Sans KR", sans-serif;
  overflow: hidden;
}

/* 왼쪽 영역 */
.login-left {
  flex: 0.5; 
  background-color: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* 로그인 카드 */
.login-card {
  background-color: #fff;
  border-radius: 12px;
  width: 420px;
  height: 560px;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; /* 중앙 정렬 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 제목 */
.login-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 40px;
}

/* 입력창 영역 */
.input-field {
  width: 100%;
  max-width: 300px;
  margin-bottom: 24px; /* 입력창 간 간격 */
}

/* 에러 메시지 */
.error-message {
  width: 100%;
  max-width: 300px;
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}

/* BaseInput 내부 input 요소 폭 강제 */
.input-field :deep(input) {
  width: 100%;
  box-sizing: border-box;
}

/* 버튼 영역 */
.button-field {
  width: 100%;
  max-width: 300px;
  margin-bottom: 28px; /* 버튼 간 간격 */
}

/* 로그인 버튼 */
.login-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 10px;
  background-color: #0c1c54;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Noto Sans KR', sans-serif;
}

.login-btn:hover:not(:disabled) {
  background-color: #15266b;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 구글 버튼 */
.google-btn {
  width: 100%;
  height: 46px;
}

/* 회원가입 안내 */
.signup-text {
  text-align: center;
  font-size: 13px;
  color: #777;
  margin-top: 10px;
}

.signup-link {
  color: #0c1c54;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
}

.signup-link:hover {
  text-decoration: underline;
}

/* 오른쪽 이미지 영역 */
.login-right {
  flex: 0.5; 
  position: relative;
  overflow: hidden;
}

/* 이미지 */
.side-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 어두운 블루 필터 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(12, 28, 84, 0.75);
}

</style>
