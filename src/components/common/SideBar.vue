<template>
  <div class="sidebar">
    <div class="sidebar-top">
      <!-- 프로필 섹션 -->
      <div class="profile-section">
        <div class="profile-image" :style="profileImageStyle">
          <img
            v-if="profileImage && !imageError"
            :src="profileImage"
            alt="프로필"
            @error="handleImageError"
          />
          <span v-else class="profile-initial">{{ getInitial(organizationName) }}</span>
        </div>
        <div class="profile-name">{{ organizationName }}</div>
      </div>

      <!-- 상단 메뉴 -->
      <div class="menu-section">
        <slot name="main-menu"></slot>
      </div>

      <!-- 관리자 메뉴: role이 'ADMIN'일 때만 렌더링 -->
      <template v-if="role === 'ADMIN' && $slots['admin-menu']">
        <hr />
        <div v-if="adminMenuTitle" class="admin-menu-title">
          {{ adminMenuTitle }}
        </div>
        <div class="menu-section">
          <slot name="admin-menu"></slot>
        </div>
      </template>
    </div>

    <!-- 하단 사용자 -->
    <div class="bottom-user">
      <div class="user-info">
        <img :src="userIcon" alt="user" class="user-icon" />
        <span>{{ userName }}</span>
      </div>
      <img
        :src="logoutIcon"
        alt="logout"
        class="logout-icon"
        @click="$emit('logout')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  // 프로필 관련
  profileImage: {
    type: String,
    default: null,
  },
  organizationName: {
    type: String,
    required: true,
  },
  // 관리자 메뉴 제목
  adminMenuTitle: {
    type: String,
    default: '관리자메뉴',
  },
  // 하단 사용자 정보
  userName: {
    type: String,
    required: true,
  },
  userIcon: {
    type: String,
    default: '/src/assets/icons/icon_user.png',
  },
  logoutIcon: {
    type: String,
    default: '/src/assets/icons/icon_navigation.png',
  },
  role: { type: String, default: 'MEMBER' },
});

defineEmits(['logout']);

const imageError = ref(false);

// 이미지 로딩 에러 처리
const handleImageError = () => {
  imageError.value = true;
};

// 조직명 또는 이름에서 첫 글자 추출
const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const profileImageStyle = computed(() => {
  if (props.profileImage && !imageError.value) {
    return {
      backgroundImage: `url(${props.profileImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {
    backgroundColor: '#d9d9d9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
});
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

.sidebar-top {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-section {
  text-align: left;
  margin-bottom: 16px;
}

.profile-image {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-bottom: 10px;
  overflow: hidden;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initial {
  color: #0c1c54;
  font-size: 28px;
  font-weight: 700;
  user-select: none;
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
