<template>
  <!-- Backdrop (배경 오버레이) -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="chat-panel-backdrop" @click="close"></div>
  </Transition>

  <!-- Side Panel -->
  <Transition name="slide">
    <div v-if="isOpen" class="chat-side-panel">
      <!-- 헤더 -->
      <div class="panel-header">
        <button v-if="currentView === 'chat'" @click="goBack" class="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 class="panel-title">{{ panelTitle }}</h2>
        <button @click="close" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="divider"></div>

      <!-- 컨텐츠 영역 -->
      <div class="panel-content">
        <!-- 조직 목록 뷰 -->
        <div v-if="currentView === 'organizations'" class="organizations-view">
          <slot name="organizations" :on-select="selectOrganization"></slot>
        </div>

        <!-- 채팅 뷰 -->
        <div v-else-if="currentView === 'chat'" class="chat-view">
          <slot name="chat"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'selectOrganization'])

// 현재 뷰 상태: 'organizations' | 'chat'
const currentView = ref('organizations')
const selectedOrganization = ref(null)

// 패널 제목
const panelTitle = computed(() => {
  if (currentView.value === 'organizations') {
    return '대화'
  }
  return selectedOrganization.value?.name || '채팅'
})

// 패널이 닫힐 때 초기화
watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) {
      // 패널이 닫히면 조직 목록으로 초기화
      setTimeout(() => {
        currentView.value = 'organizations'
        selectedOrganization.value = null
      }, 300) // 애니메이션 후 초기화
    }
  }
)

// 조직 선택
const selectOrganization = (organization) => {
  selectedOrganization.value = organization
  currentView.value = 'chat'
  emit('selectOrganization', organization)
}

// 뒤로가기
const goBack = () => {
  currentView.value = 'organizations'
  selectedOrganization.value = null
}

// 패널 닫기
const close = () => {
  emit('close')
}

// 부모 컴포넌트에서 접근할 수 있도록 expose
defineExpose({
  selectOrganization,
  goBack,
  currentView
})
</script>

<style scoped>
/* Backdrop */
.chat-panel-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

/* Side Panel */
.chat-side-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  max-width: 90vw;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background-color: #ffffff;
}

.panel-title {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0c1c54;
  text-align: center;
}

.back-button,
.close-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.back-button:hover,
.close-button:hover {
  background-color: #f0f0f0;
  color: #0c1c54;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
}

/* 컨텐츠 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.organizations-view,
.chat-view {
  height: 100%;
}

/* 애니메이션 - Slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 애니메이션 - Backdrop */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* 스크롤바 스타일 */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* 반응형 - 모바일 */
@media (max-width: 768px) {
  .chat-side-panel {
    width: 100vw;
    max-width: 100vw;
  }
}
</style>
