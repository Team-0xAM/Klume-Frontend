<template>
  <div class="org-manage-container">
    <div class="page-header">
      <h2>조직 관리</h2>
      <p>조직 정보, 그룹, 회원을 통합적으로 관리할 수 있습니다</p>
    </div>

    <div class="tab-header">
      <div v-for="tab in tabs" :key="tab.value" class="tab-item" :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value">
        {{ tab.label }}
      </div>
      <div class="tab-underline" :style="underlineStyle"></div>
    </div>

    <transition name="fade" mode="out-in">
      <component :is="currentTabComponent" class="tab-content" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import OrganizationInfo from '@/components/organization/OrganizationInfo.vue'
import GroupManage from '@/components/organization/GroupManage.vue'
import MemberManage from '@/components/organization/MemberManage.vue'

const tabs = [
  { label: '조직 정보', value: 'info', component: OrganizationInfo },
  { label: '그룹 관리', value: 'group', component: GroupManage },
  { label: '회원 관리', value: 'member', component: MemberManage }
]

const activeTab = ref('info')
const underlineLeft = ref(0)
const underlineWidth = ref(0)

const currentTabComponent = computed(() => {
  return tabs.find(t => t.value === activeTab.value)?.component || OrganizationInfo
})

const updateUnderline = () => {
  nextTick(() => {
    const activeEl = document.querySelector('.tab-item.active')
    if (activeEl) {
      underlineLeft.value = activeEl.offsetLeft
      underlineWidth.value = activeEl.offsetWidth
    }
  })
}

onMounted(updateUnderline)
watch(activeTab, updateUnderline)

const underlineStyle = computed(() => ({
  left: `${underlineLeft.value}px`,
  width: `${underlineWidth.value}px`
}))
</script>

<style scoped>
.org-manage-container {
  /* 공지사항 관리 페이지와 동일 */
  min-height: 100vh;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #222;
}


/* ---------------- 페이지 헤더 ---------------- */
.page-header {
  margin-bottom: 28px;
}

.page-header h2 {
  font-weight: 700;
  color: #1b3b8b;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* ---------------- 탭 영역 ---------------- */
.tab-header {
  display: flex;
  position: relative;
  border-bottom: 2px solid #e5e8eb;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 0 8px;
}

.tab-item {
  padding: 14px 28px;
  font-size: 17px;
  font-weight: 500;
  color: #777;
  cursor: pointer;
  transition: color 0.25s ease;
}

.tab-item:hover {
  color: #1b3b8b;
}

.tab-item.active {
  font-weight: 700;
  color: #1b3b8b;
}

/* 밑줄 (부드러운 애니메이션) */
.tab-underline {
  position: absolute;
  bottom: 0;
  height: 3px;
  background-color: #1b3b8b;
  transition: all 0.3s ease;
  border-radius: 2px;
}

/* ---------------- 탭 콘텐츠 ---------------- */
.tab-content {
  background: #fff;
  border-radius: 0 0 8px 8px;
  padding: 32px 28px;
  margin-top: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 전환 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
