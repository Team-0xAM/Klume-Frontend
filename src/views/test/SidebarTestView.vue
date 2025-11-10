<template>
  <SideBar
    organization-name="조직명"
    user-name="라이언"
    admin-menu-title="관리자메뉴"
    @logout="handleLogout"
  >
    <!-- 상단 메뉴 -->
    <template #main-menu>
      <NavButton
        label="홈"
        icon="icon_home.png"
        :isActive="activeMenu === '홈'"
        @click="setActive('홈')"
      />
      <NavButton
        label="예약하기"
        icon="icon_clock.png"
        :isActive="activeMenu === '예약하기'"
        @click="setActive('예약하기')"
      />
      <NavButton
        label="공지사항"
        icon="icon_map.png"
        :isActive="activeMenu === '공지사항'"
        @click="setActive('공지사항')"
      />
      <NavButton
        label="내 예약 보기"
        icon="icon_check.png"
        :isActive="activeMenu === '내 예약 보기'"
        @click="setActive('내 예약 보기')"
      />
      <NavButton
        label="조직 대시보드로 가기"
        icon="icon_grid.png"
        :isActive="activeMenu === '조직 대시보드로 가기'"
        @click="setActive('조직 대시보드로 가기')"
      />
    </template>

    <!-- 관리자 메뉴 -->
    <template #admin-menu>
      <NavButton
        label="예약 관리"
        icon="icon_calendar.png"
        :isActive="activeMenu === '예약 관리'"
        @click="setActive('예약 관리')"
      />
      <NavButton
        label="회의실 관리"
        icon="icon_navigation.png"
        :isActive="activeMenu === '회의실 관리'"
        @click="setActive('회의실 관리')"
      />
      <NavButton
        label="조직 관리"
        icon="icon_users.png"
        :isActive="activeMenu === '조직 관리'"
        @click="setActive('조직 관리')"
      />
      <NavButton
        label="공지사항 관리"
        icon="icon_bookmark.png"
        :isActive="activeMenu === '공지사항 관리'"
        @click="setActive('공지사항 관리')"
      />
      <NavButton
        label="채팅 문의"
        icon="icon_circle.png"
        :isActive="activeMenu === '채팅 문의'"
        @click="setActive('채팅 문의')"
      />
    </template>
  </SideBar>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavButton from '@/components/common/NavButton.vue'

const activeMenu = ref('홈') // 기본 선택 메뉴
const setActive = (label) => {
  activeMenu.value = label
}

const handleLogout = () => {
  console.log('로그아웃 클릭')
  // 로그아웃 로직 추가
}
</script>

<style scoped>
/* SideBar 컴포넌트 내부에서 스타일 처리 */
</style>
