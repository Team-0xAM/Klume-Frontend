<template>
  <div class="forbidden-page">
    <h1>🚫 접근 권한이 없습니다.</h1>
    <p>관리자만 접근 가능한 페이지입니다.</p>
    <router-link to="/">홈으로 돌아가기</router-link>
  </div>
</template>

<style scoped>
.forbidden-page {
  text-align: center;
  margin-top: 150px;
}
</style>
