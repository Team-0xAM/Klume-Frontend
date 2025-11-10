<template>
  <div class="org-join-container">
    <h1 class="welcome-text">
      환영합니다! 이제 회의실 예약을 시작해볼까요?
    </h1>

    <div class="card-wrapper">
      <!-- 조직 생성 카드 -->
      <div class="action-card" @click="goToCreate">
        <img src="@/assets/images/create_new_org.png" alt="조직 생성" class="card-image" />
        <h2 class="card-title">조직 새로 생성하기</h2>
        <p class="card-desc">
          우리 팀만의 공간을 직접 만들고,<br />
          초대 코드를 생성해 공유해보세요!
        </p>
      </div>

      <!-- 조직 가입 카드 -->
      <div class="action-card" @click="goToJoin">
        <img src="@/assets/images/join_with_code.png" alt="조직 가입" class="card-image" />
        <h2 class="card-title">초대코드로 조직 가입하기</h2>
        <p class="card-desc">
          받은 초대코드를 입력해,<br />
          팀의 공간에 함께 참여해보세요!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToCreate = () => {
  router.push('/organization/create')
}

const goToJoin = () => {
  router.push('/organization/join')
}
</script>

<style scoped>
.org-join-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 60px;
}

.welcome-text {
  font-size: 20px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 60px;
  text-align: center;
}

/* 카드 리스트 */
.card-wrapper {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

/* 개별 카드 */
.action-card {
  width: 360px;
  height: 400px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 160px;
  height: auto;
  margin-bottom: 30px;
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #0c1c54;
  margin-bottom: 10px;
}

.card-desc {
  font-size: 14px;
  color: #555e7b;
  line-height: 1.6;
  white-space: pre-line;
}
</style>
