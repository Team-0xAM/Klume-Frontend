<template>
  <div class="org-layout">
    <SideBar
      :organization-name="organizationName"
      :profile-image="organizationImage"
      :user-name="userNickname"
      :role="organizationRole"
      @logout="logout"
    >
      <!-- 메인 메뉴 -->
      <template #main-menu>
        <NavButton
          label="홈"
          icon="icon_home.png"
          :to="{ name: 'OrganizationDashboard', params: { organizationId: route.params.organizationId } }"
        />
        <NavButton
          label="예약하기"
          icon="icon_clock.png"
          :to="{ name: 'ReservationPage', params: { organizationId: route.params.organizationId } }"
        />
        <NavButton
          label="내 예약 보기"
          icon="icon_check.png"
          :to="{ name: 'MyReservationPage', params: { organizationId: route.params.organizationId } }"
        />
        <NavButton
          label="공지사항"
          icon="icon_bookmark.png"
          :to="{ name: 'NoticePage', params: { organizationId: route.params.organizationId } }"
        />
        <NavButton
          label="조직 대시보드로 가기"
          icon="icon_grid.png"
          :to="'/organization'"
        />
      </template>

      <!-- 관리자 메뉴: ADMIN만 노출 -->
      <template v-if="organizationRole === 'ADMIN'" #admin-menu>
        <NavButton
          label="예약 관리"
          icon="icon_calendar.png"
          :to="{ name: 'AdminReservationManage', params: { organizationId: route.params.organizationId } }"
        />
        <NavButton
          label="회의실 관리"
          icon="icon_navigation.png"
          :to="{ name: 'AdminRoomManage', params: { organizationId: route.params.organizationId } }"
        />
        <NavButton
          label="조직 관리"
          icon="icon_users.png"
          :to="{ name: 'OrganizationManage', params: { organizationId: route.params.organizationId } }"
        />
        <NavButton
          label="공지사항 관리"
          icon="icon_bookmark.png"
          :to="`/organization/${route.params.organizationId}/admin/notices`"
        />
        <NavButton
          label="채팅 문의"
          icon="icon_circle.png"
          :to="`/organizations/${route.params.organizationId}/chat`"
        />
      </template>
    </SideBar>

    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavButton from '@/components/common/NavButton.vue'
import { fetchOrganizationInfo, organizationRole, organizationName, organizationImage, userNickname } from '@/composables/useOrganization.js'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const orgId = route.params.organizationId
  fetchOrganizationInfo(orgId)
})

const logout = () => {
  // 로그아웃 후 로그인 페이지로 이동
  router.push('/login')
}
</script>

<style scoped>
.org-layout {
  display: flex;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  background-color: #f5f6fa;
  padding: 40px;
}
</style>
