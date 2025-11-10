<script setup>
import { RouterView } from 'vue-router';
import BaseHeader from './components/common/BaseHeader.vue';
</script>

<template>
  <BaseHeader />
  <RouterView />
  <!-- <Footer /> -->
</template>

<style>
/* 전역 스타일 - 입력 요소를 제외한 모든 요소에서 텍스트 선택 방지 */
* {
  margin: 0px;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 입력 요소들은 텍스트 커서 및 선택 가능 */
input,
textarea,
[contenteditable="true"] {
  cursor: text !important;
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

/* 클릭 가능한 요소들은 포인터 커서 */
a,
button,
[role="button"],
[onclick] {
  cursor: pointer !important;
}

/* 링크는 포인터 커서 */
a:hover {
  cursor: pointer !important;
}
</style>

<style scoped></style>