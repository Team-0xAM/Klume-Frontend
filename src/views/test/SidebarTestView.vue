<template>
  <div class="sidebar">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-image"></div>
      <div class="profile-name">조직명</div>
    </div>

    <!-- 상단 메뉴 -->
    <div class="menu-section">
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
    </div>

    <hr />

    <!-- 관리자 메뉴 -->
    <div class="admin-menu-title">관리자메뉴</div>

    <div class="menu-section">
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
    </div>

    <hr />

    <!-- 하단 사용자 -->
    <div class="bottom-user">
      <div class="user-info">
        <img src="@/assets/icons/icon_user.png" alt="user" class="user-icon" />
        <span>라이언</span>
      </div>
      <img
        src="@/assets/icons/icon_navigation.png"
        alt="logout"
        class="logout-icon"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavButton from '@/components/common/SideBar.vue'

const activeMenu = ref('홈') // 기본 선택 메뉴
const setActive = (label) => {
  activeMenu.value = label
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  padding: 20px 16px;
  background-color: #ffffff;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Noto Sans KR', sans-serif;
}
.profile-section {
  text-align: left;
  margin-bottom: 16px;
}
.profile-image {
  width: 70px;
  height: 70px;
  background-color: #d9d9d9;
  border-radius: 50%;
  margin-bottom: 10px;
}
.profile-name {
  font-weight: 700;
  color: #0c1c54;
  font-size: 18px;
}
.menu-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 16px 0;
}
.admin-menu-title {
  color: #0c1c54;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
.bottom-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #eee;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 15px;
  color: #000;
}
.user-icon {
  width: 20px;
  height: 20px;
}
.logout-icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.logout-icon:hover {
  opacity: 1;
}
</style>
