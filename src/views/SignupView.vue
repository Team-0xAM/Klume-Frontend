<template>
  <div class="signup-container">
    <!-- 왼쪽 회원가입 폼 -->
    <div class="signup-left">
      <div class="signup-card">
        <h2 class="signup-title">회원가입</h2>

        <div class="input-field">
          <label class="label">이메일</label>
          <div class="email-section">
            <BaseInput v-model="email" placeholder="이메일을 입력하세요" :disabled="isVerified" />
            <BaseButton
              :label="isSending ? '전송 중...' : '인증코드 전송'"
              class="verify-btn"
              :disabled="isSending || isVerified"
              @click="sendVerificationCode"
            />
          </div>
        </div>

        <div class="input-field" v-if="showCodeInput">
          <label class="label">인증코드</label>
          <div class="code-section">
            <BaseInput v-model="code" placeholder="인증코드 입력" :disabled="isVerified" />
            <BaseButton
              label="확인"
              class="check-btn"
              :disabled="isVerified"
              @click="verifyCodeHandler"
            />
          </div>
          <div class="timer" :class="{ expired: timeLeft <= 0 }">{{ formattedTime }}</div>
        </div>

        <div class="input-field">
          <label class="label">비밀번호</label>
          <BaseInput v-model="password" placeholder="비밀번호 입력" type="password" />
        </div>

        <div class="input-field">
          <label class="label">비밀번호 확인</label>
          <BaseInput v-model="passwordConfirm" placeholder="비밀번호 확인 입력" type="password" />
        </div>

        <!-- 회원가입 버튼 -->
        <div class="button-field">
          <BaseButton
            label="회원가입"
            variant="primary"
            class="signup-btn"
            @click="handleSignup"
          />
        </div>

        <!-- 구글 로그인 -->
        <div class="button-field">
          <GoogleButton
            label="Google 계정으로 로그인"
            class="google-btn"
            @click="handleGoogleLogin"
          />
        </div>
      </div>
    </div>

    <!-- 오른쪽 이미지 영역 -->
    <div class="signup-right">
      <img src="@/assets/images/login_side.png" alt="side" class="side-image" />
      <div class="image-overlay"></div>
    </div>

    <!-- ✅ 커스텀 모달 -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-box">
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <p class="modal-message">{{ modalMessage }}</p>
        <button class="modal-btn" @click="handleModalConfirm">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { sendVerificationCode as sendCode, verifyCode as checkCode, signup } from "@/api/auth"
import BaseInput from "@/components/common/BaseInput.vue"
import BaseButton from "@/components/common/BaseButton.vue"
import GoogleButton from "@/components/common/GoogleButton.vue"

const router = useRouter()

// 입력값
const email = ref("")
const code = ref("")
const password = ref("")
const passwordConfirm = ref("")

// 인증 관련 상태
const showCodeInput = ref(false)
const isSending = ref(false)
const isVerified = ref(false)
const timerActive = ref(false)
const timeLeft = ref(0)
let timer = null

// 모달 관련 상태
const showModal = ref(false)
const modalTitle = ref("")
const modalMessage = ref("")
let signupSuccess = false

// 남은 시간 표시
const formattedTime = computed(() => {
  const min = Math.floor(timeLeft.value / 60)
  const sec = timeLeft.value % 60
  return timeLeft.value > 0
    ? `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : "만료됨"
})

// 인증코드 전송
const sendVerificationCode = async () => {
  if (!email.value) {
    modalTitle.value = "이메일 입력 필요"
    modalMessage.value = "이메일을 입력해주세요."
    showModal.value = true
    return
  }

  isSending.value = true

  try {
    await sendCode(email.value)

    // 성공 시 타이머 시작
    showCodeInput.value = true
    timerActive.value = true
    timeLeft.value = 180 // 3분

    timer = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        clearInterval(timer)
        timerActive.value = false
      }
    }, 1000)

    modalTitle.value = "인증코드 전송 완료"
    modalMessage.value = "이메일로 인증코드가 전송되었습니다."
    showModal.value = true
  } catch (error) {
    console.error('인증코드 전송 오류:', error)

    if (error.response) {
      modalTitle.value = "전송 실패"
      modalMessage.value = error.response.data.message || "인증코드 전송에 실패했습니다."
    } else {
      modalTitle.value = "전송 실패"
      modalMessage.value = "서버에 연결할 수 없습니다."
    }
    showModal.value = true
  } finally {
    isSending.value = false
  }
}

// 인증코드 검증
const verifyCodeHandler = async () => {
  if (!code.value.trim()) {
    modalTitle.value = "인증코드 필요"
    modalMessage.value = "인증코드를 입력해주세요."
    showModal.value = true
    return
  }

  try {
    await checkCode(email.value, code.value)

    // 인증 성공
    isVerified.value = true
    modalTitle.value = "인증 완료 🎉"
    modalMessage.value = "이메일 인증이 성공적으로 완료되었습니다."
    showModal.value = true
    clearInterval(timer)
    timerActive.value = false
  } catch (error) {
    console.error('인증코드 검증 오류:', error)

    if (error.response) {
      modalTitle.value = "인증 실패"
      modalMessage.value = error.response.data.message || "올바른 인증코드를 입력해주세요."
    } else {
      modalTitle.value = "인증 실패"
      modalMessage.value = "서버에 연결할 수 없습니다."
    }
    showModal.value = true
  }
}

// 회원가입 처리
const handleSignup = async () => {
  // 유효성 검사
  if (!email.value || !password.value || !passwordConfirm.value) {
    modalTitle.value = "입력값 누락"
    modalMessage.value = "모든 필드를 입력해주세요."
    showModal.value = true
    return
  }

  if (!isVerified.value) {
    modalTitle.value = "이메일 인증 필요"
    modalMessage.value = "이메일 인증을 완료해주세요."
    showModal.value = true
    return
  }

  if (password.value !== passwordConfirm.value) {
    modalTitle.value = "비밀번호 불일치"
    modalMessage.value = "비밀번호가 서로 일치하지 않습니다."
    showModal.value = true
    return
  }

  try {
    await signup({
      email: email.value,
      password: password.value,
    })

    // 회원가입 성공
    signupSuccess = true
    modalTitle.value = "회원가입 성공 🎉"
    modalMessage.value = "Klume에 오신 걸 환영합니다!"
    showModal.value = true
  } catch (error) {
    console.error('회원가입 오류:', error)

    if (error.response) {
      modalTitle.value = "회원가입 실패"
      modalMessage.value = error.response.data.message || "이미 존재하는 이메일이거나 서버 오류입니다."
    } else {
      modalTitle.value = "회원가입 실패"
      modalMessage.value = "서버에 연결할 수 없습니다."
    }
    showModal.value = true
  }
}

const handleModalConfirm = () => {
  showModal.value = false
  if (signupSuccess) {
    router.push("/auth/login")
  }
}

const handleGoogleLogin = () => {
  window.location.href = "http://localhost:8080/oauth2/authorization/google"
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.signup-container {
  display: flex;
  width: 100%;
  height: 100vh;
  font-family: "Noto Sans KR", sans-serif;
  overflow: hidden;
}

/* 왼쪽 폼 영역 */
.signup-left {
  flex: 0.4;
  background-color: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* 회원가입 카드 */
.signup-card {
  background-color: #fff;
  border-radius: 12px;
  width: 420px;
  height: 650px;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 제목 */
.signup-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 40px;
}

/* ✅ 라벨 스타일 */
.label {
  align-self: flex-start;
  font-size: 14px;
  font-weight: 600;
  color: #0c1c54;
  margin-bottom: 6px;
  margin-left: 5px;
}

/* 이메일 + 인증코드 전송 */
.email-section {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 300px;
  gap: 10px;

}

/* 인증코드 입력 + 확인 버튼 */
.code-section {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 300px;
  gap: 10px;
  position: relative;
}

/* ✅ input 통일 */
.email-section :deep(input),
.code-section :deep(input),
.input-field :deep(input) {
  width: 100%;
  box-sizing: border-box;
}

/* 버튼 공통 스타일 */
.verify-btn,
.check-btn {
  width: 110px;
  height: 44px;
  border-radius: 6px;
  font-size: 13px;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 타이머 */
.timer {
  font-size: 13px;
  color: #888;
  text-align: left;
  margin-top: 4px;
  margin-left: 5px;
}

.timer.expired {
  color: #d9534f;
}

/* 비밀번호 입력 필드 */
.input-field {
  width: 100%;
  max-width: 300px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

/* 회원가입 버튼 */
.button-field {
  width: 100%;
  max-width: 300px;
  margin-top: 10px;
  margin-bottom: 18px;
}

.signup-btn {
  width: 100%;
  height: 46px;
}

/* 구글 로그인 버튼 */
.google-btn {
  width: 100%;
  height: 46px;
  margin-top: 4px;
}

/* 오른쪽 이미지 영역 */
.signup-right {
  flex: 0.6;
  position: relative;
  overflow: hidden;
}

.side-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(12, 28, 84, 0.75);
}

/* ✅ 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background-color: #fff;
  border-radius: 10px;
  width: 380px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.25s ease-in-out;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 12px;
}

.modal-message {
  font-size: 15px;
  color: #333;
  margin-bottom: 28px;
  line-height: 1.5;
}

.modal-btn {
  background-color: #0b174e;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-btn:hover {
  background-color: #09133e;
}

/* 모달 등장 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>
