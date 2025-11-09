<template>
  <div class="home-container">

    <!-- 상단 메인 배너 -->
    <section class="banner-section">
      <img src="@/assets/images/home_banner.png" alt="home banner" class="banner-image" />
      <div class="banner-overlay">
        <div class="banner-content">
          <p class="banner-subtext">회의실 예약의 새로운 문화, <span class="highlight">KLÜME</span></p>
          <h1 class="banner-title">
            회의실 예약, 티켓팅처럼 공정하게.
          </h1>
          <p class="banner-description">
            정해진 시간에 열리는 회의실 예약 오픈! <br />
            누가 먼저 클릭하느냐에 따라 순위가 갈리는 실시간 선착순 시스템 <br /><br />
            공간이 적어도, 모두가 같은 조건에서 공평하게.
          </p>

          <div class="button-wrapper">
            <BaseYellowButton label="시작하기" class="start-btn" @click="goLogin" />
          </div>
        </div>
      </div>
    </section>

    <!-- 중간 문제 섹션 -->
    <section class="problem-section">
      <img src="@/assets/images/home_mid_banner.png" alt="problem banner" class="mid-banner" />
    </section>

    <!-- 이어지는 네이비 배경 영역 -->
    <section class="after-banner-section">
      <div class="after-content">
        <!-- KLÜME의 해결 방식 or CTA 영역 -->
      </div>
    </section>
  </div>
</template>

<script setup>
import BaseYellowButton from '@/components/common/BaseYellowButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goLogin = () => router.push('/auth/login')
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #ffffff;
}

/* ─────────────── 상단 배너 ─────────────── */
.banner-section {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(12, 28, 84, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
  color: white;
  padding: 20px;
  max-width: 800px;
}

.banner-subtext {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #ffffffcc;
}

.banner-title {
  font-size: 50px;
  font-weight: 800;
  line-height: 1.4;
  color: #ffffff;
  margin-bottom: 30px;
}

.banner-description {
  font-size: 16px;
  line-height: 1.8;
  color: #dddddd;
  margin-bottom: 40px;
}

.highlight {
  color: #f5c843;
  font-weight: 700;
}

.button-wrapper {
  display: flex;
  justify-content: center;
}

/* ✅ 버튼 크기 조정 */
.start-btn {
  width: 160px; /* 적당히 작은 비율 */
  height: 48px;
  font-size: 16px;
}

/* ─────────────── 중간 섹션 ─────────────── */
.problem-section {
  width: 100%;
  overflow: hidden;
}

.mid-banner {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

/* ─────────────── 이어지는 네이비 배경 ─────────────── */
.after-banner-section {
  width: 100%;
  background-color: #0b174e;
  height: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.after-content {
  color: white;
  font-size: 18px;
  text-align: center;
  opacity: 0.8;
}
</style>
