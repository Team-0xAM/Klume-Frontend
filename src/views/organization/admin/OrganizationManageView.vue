<template>
  <div class="org-manage-container">
    <div class="page-header">
      <h2>조직 관리</h2>
      <p>조직 정보, 그룹, 회원을 통합적으로 관리할 수 있습니다</p>
    </div>

    <div class="invite-container">
      <div class="invite-button-container">
        <BaseButton label="초대하기" :height="40" :fontSize="14" depth="bold" @click="handleInvite" />
      </div>
    </div>

    <div class="tab-header">
      <div v-for="tab in tabs" :key="tab.value" class="tab-item" :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value">
        {{ tab.label }}
      </div>
      <div class="tab-underline" :style="underlineStyle"></div>
    </div>

    <transition name="fade" mode="out-in">
      <component :is="currentTabComponent" class="tab-content" :organization-id="organizationId" />
    </transition>

    <!-- 초대 코드 모달 -->
    <div v-if="showInviteModal" class="modal-overlay" @click="closeInviteModal">
      <div class="invite-modal" @click.stop>
        <div class="modal-icon">
          <img :src="InvitationImage">
        </div>

        <h3 class="modal-title">{{ organization?.name }}</h3>

        <p class="modal-description">
          새로운 구성원을 우리 조직에 초대해 보세요.<br>
          아래 초대 코드를 복사하여 손쉽게 공유할 수 있습니다.
        </p>

        <div class="invite-code-container">
          <div v-if="inviteCode" class="code-boxes">
            <div v-for="(char, index) in inviteCode" :key="index" class="code-box">
              {{ char }}
            </div>
          </div>
          <button class="copy-button" @click="copyInviteCode">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
              <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                stroke="currentColor" stroke-width="2" />
            </svg>
          </button>
        </div>

        <button class="confirm-button" @click="closeInviteModal">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import OrganizationInfo from '@/components/organization/OrganizationInfo.vue'
import GroupManage from '@/components/organization/GroupManage.vue'
import MemberManage from '@/components/organization/MemberManage.vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { getinvitationCode } from '@/api/organization/organizationMember'
import { getOrganizationById } from '@/api/organization'
import InvitationImage from '@/assets/images/join_with_code.png'

const tabs = [
  { label: '조직 정보', value: 'info', component: OrganizationInfo },
  { label: '그룹 관리', value: 'group', component: GroupManage },
  { label: '회원 관리', value: 'member', component: MemberManage }
]

const activeTab = ref('info')
const underlineLeft = ref(0)
const underlineWidth = ref(0)
const showInviteModal = ref(false)
const inviteCode = ref('')

const route = useRoute()
const organizationId = Number(route.params.organizationId)

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

onMounted(() => {
  updateUnderline()
  fetchOrganization()
})

watch(activeTab, updateUnderline)

const organization = ref(null)

const fetchOrganization = async () => {
  try {
    const response = await getOrganizationById(organizationId)

    organization.value = response.data
  } catch (error) {
    console.error('조직 정보 가져오기 실패:', error)
  }
}

const underlineStyle = computed(() => ({
  left: `${underlineLeft.value}px`,
  width: `${underlineWidth.value}px`
}))

const handleInvite = async () => {
  try {
    const response = await getinvitationCode(organizationId)

    inviteCode.value = response.data.code
    showInviteModal.value = true

  } catch (error) {
    console.error('초대 코드 생성 실패:', error)
    alert('초대 코드 생성에 실패했습니다.')
  }
}

const closeInviteModal = () => {
  showInviteModal.value = false
}

const copyInviteCode = () => {
  navigator.clipboard.writeText(inviteCode.value)
    .then(() => {
      alert('초대 코드가 복사되었습니다!')
    })
    .catch(() => {
      alert('복사에 실패했습니다.')
    })
}

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

.invite-button-container {
  width: 15%;
  justify-content: flex-end;
  margin-bottom: 16px;

}

.invite-container {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 초대 모달 */
.invite-modal {
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  width: 460px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.modal-icon {
  display: flex;
  justify-content: center;
}

.modal-icon>img {
  display: flex;
  justify-content: center;
  width: 200px;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #1b3b8b;
  margin-bottom: 16px;
}

.modal-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
}

/* 초대 코드 컨테이너 */
.invite-code-container {
  background: #f8f9fb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.code-boxes {
  display: flex;
  gap: 8px;
}

.code-box {
  width: 48px;
  height: 56px;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #1b3b8b;
}

.copy-button {
  width: 44px;
  height: 44px;
  background: #1b3b8b;
  color: #fff;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-button:hover {
  background: #0f2970;
}

/* 확인 버튼 */
.confirm-button {
  width: 100%;
  background-color: #1b3b8b;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.confirm-button:hover {
  background-color: #0f2970;
}
</style>