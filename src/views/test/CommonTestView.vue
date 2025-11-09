<template>
  <div class="test-container">
    <h1>공통 컴포넌트 테스트</h1>

    <!-- BaseInput -->
    <section class="test-section">
      <h2>BaseInput</h2>
      <BaseInput v-model="email" placeholder="이메일" />
      <BaseInput v-model="password" type="password" placeholder="비밀번호" />
      <p>입력된 이메일: {{ email }}</p>
      <p>입력된 비밀번호: {{ password }}</p>
    </section>

    <hr />

    <!-- BaseButton -->
    <section class="test-section">
      <h2>BaseButton (남색 버튼)</h2>
      <BaseButton label="로그인" height="48" depth="bold" @click="onClick('로그인')" />
      <BaseButton label="회원가입" height="44" @click="onClick('회원가입')" />
    </section>

    <hr />

    <!-- BaseGrayButton -->
    <section class="test-section">
      <h2>BaseGrayButton (회색 버튼)</h2>
      <div class="button-row">
        <BaseGrayButton label="이전" height="44" width="120" @click="onClick('이전')" />
        <BaseGrayButton label="취소" height="44" width="140" depth="bold" @click="onClick('취소')" />
      </div>
    </section>

    <hr />

    <!-- BaseYellowButton -->
    <section class="test-section">
      <h2>BaseYellowButton (노란 버튼)</h2>
      <BaseYellowButton label="시작하기" height="50" @click="onClick('시작하기')" />
    </section>

    <hr />

    <!-- GoogleButton -->
    <section class="test-section">
      <h2>GoogleButton (OAuth 로그인용)</h2>
      <GoogleButton @click="onClick('Google 로그인')" />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseGrayButton from '@/components/common/BaseGrayButton.vue'
import BaseYellowButton from '@/components/common/BaseYellowButton.vue'
import GoogleButton from '@/components/common/GoogleButton.vue'

const email = ref('')
const password = ref('')
const clickCount = ref(0)

const onClick = (label) => {
  clickCount.value++
  console.log(`${label} 버튼 클릭됨 - 총 ${clickCount.value}번째 호출`)
  alert(`${label} 버튼 클릭됨 - 총 ${clickCount.value}번째 호출`)
}
</script>

<style scoped>
.test-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: #fafafa;
  font-family: 'Noto Sans KR', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #0c1c54;
}

.test-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 25px;
}

.button-row {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}

hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 20px 0;
}
</style>
