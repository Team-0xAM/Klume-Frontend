<script setup>
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import BaseHeader from './components/common/BaseHeader.vue'
import ChatFloatingButton from './components/common/ChatFloatingButton.vue'
import ChatSidePanel from './components/common/ChatSidePanel.vue'
import MemberChatOrganizationList from './components/chat/MemberChatOrganizationList.vue'
import MemberChatView from './components/chat/MemberChatView.vue'
import { useChatPanel } from './composables/useChatPanel'
import { isAuthenticated } from './utils/auth'

const { isPanelOpen, selectedOrganization, closePanel } = useChatPanel()

// 로그인 상태 확인
const isLoggedIn = computed(() => isAuthenticated())

// 조직 선택 핸들러
const handleSelectOrganization = (org) => {
  selectedOrganization.value = org
}
</script>

<template>
  <BaseHeader />
  <RouterView />

  <!-- 채팅 플로팅 버튼 (로그인 시에만 표시) -->
  <ChatFloatingButton v-if="isLoggedIn" @click="isPanelOpen = true" :unread-count="0" />

  <!-- 채팅 사이드 패널 -->
  <ChatSidePanel :is-open="isPanelOpen" @close="closePanel" @select-organization="handleSelectOrganization">
    <!-- 조직 목록 슬롯 -->
    <template #organizations="{ onSelect }">
      <MemberChatOrganizationList @select="onSelect" />
    </template>

    <!-- 채팅 슬롯 -->
    <template #chat>
      <MemberChatView v-if="selectedOrganization" :organization="selectedOrganization" />
    </template>
  </ChatSidePanel>
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