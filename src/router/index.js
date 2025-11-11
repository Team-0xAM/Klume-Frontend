import { createRouter, createWebHistory } from "vue-router";

import { isAuthenticated } from "@/utils/auth";
import { organizationRole, fetchOrganizationInfo } from "@/composables/useOrganization.js";

// --- 공용 뷰 ---
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import SignupView from "@/views/SignupView.vue";
import OAuthCallbackView from "@/views/OAuthCallbackView.vue";
import OrganizationView from "@/views/OrganizationView.vue";
import OrganizationJoinView from "@/views/OrganizationJoinView.vue";
import ChatRoomListView from "@/views/ChatRoomListView.vue";
import ChatView from "@/views/ChatView.vue";
import NoticeAdminPageView from "@/views/NoticeAdminPageView.vue";
import OrganizationCreateView from "@/views/OrganizationCreateView.vue";
import OrganizationJoinWithCodeView from "@/views/OrganizationJoinWithCodeView.vue";


import CommonTestView from "@/views/test/CommonTestView.vue";
import SidebarTestView from '@/views/test/SidebarTestView.vue'
import ModalTestView from "@/views/test/ModalTestView.vue";
import OrganizationListTestView from "@/views/test/OrganizationListTestView.vue";
import MeetingRoomList from '@/components/room/MeetingRoomList.vue';
import AdminRoomPage from '@/views/room/AdminRoomPage.vue';
import AdminReservationPage from '@/views/adminreservation/AdminReservationPage.vue';
import userhome from '@/views/test/userhome.vue';
import ReservationPage from '@/views/reservation/ReservationPage.vue';
import RoomDetail from '@/views/reservation/RoomDetail.vue';
import AdminRoomDetail from '@/views/room/AdminRoomDetail.vue';

// --- 조직 관련 레이아웃 및 페이지 ---
import OrganizationLayout from "@/components/layout/OrganizationLayout.vue";
import OrganizationDashboard from "@/views/organization/OrganizationDashboard.vue";
import RoomManage from "@/views/organization/admin/RoomManage.vue";
import ReservationManage from "@/views/organization/admin/ReservationManage.vue";
import ForbiddenView from "@/views/error/ForbiddenView.vue"; // 🚫 403 페이지

// --- routes ---
const routes = [

  { path: "/home", component: HomeView },
  { path: "/", redirect: "/home" },
  { path: "/auth/login", component: LoginView, meta: { requiresGuest: true } },
  { path: "/auth/signup", component: SignupView, meta: { requiresGuest: true } },
  { path: "/oauth/callback", component: OAuthCallbackView },
  { path: "/organization", component: OrganizationView, meta: { requiresAuth: true } },
  { path: "/organization/join", component: OrganizationJoinView, meta: { requiresAuth: true } },

  // 🚫 403 접근 권한 없음
  {
    path: "/403",
    name: "Forbidden",
    component: ForbiddenView,
  },

    {path: '/', component: HomeView},
    {path: '/test/common', component: CommonTestView},
    {path: '/test/sidebar', component: SidebarTestView},
    {path: '/test/modar', component: ModalTestView},
    {path: '/test/orgcard', component: OrganizationListTestView},


    /* 관리자메뉴 회의실 관리페이지 */
    {path: '/adminroomlist', component: AdminRoomPage},
    {
      path: "/organization/:organizationId/admin/rooms/:roomId",
      name: "AdminRoomDetail",
      component: AdminRoomDetail,
      meta: { requiresAdmin: true },
    },

    /* 피그마용 삭제예정 */
    {path: '/adminreservation', component: AdminReservationPage},
    {path: '/userhome', component: userhome},

    { path: '/reservation', component: ReservationPage },
    { path: '/reservation/:roomId', component: RoomDetail },

    { path: '/dashboard', component: OrganizationDashboard },

    // 채팅 관련 라우트 (관리자용)
    {path: '/organizations/:organizationId/chat', component: ChatRoomListView, meta: { requiresAuth: true }},
    {path: '/organizations/:organizationId/chat/:roomId', component: ChatView, meta: { requiresAuth: true }},

    {path: '/organization/:organizationId/notices', component: NoticeAdminPageView},
    {path: '/organization/new', component: OrganizationJoinView},
    {path: '/organization/create', component: OrganizationCreateView},

];

// --- router setup ---
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- 라우터 가드 ---
router.beforeEach(async (to, from, next) => {
  const authenticated = isAuthenticated();

  // 🔒 로그인 필요
  if (to.meta.requiresAuth && !authenticated) {
    return next("/auth/login");
  }

  // 🚫 로그인한 사용자가 비로그인 전용 페이지 접근
  if (to.meta.requiresGuest && authenticated) {
    return next("/home");
  }

  // 👑 관리자 접근 제한
  if (to.meta.requiresAdmin) {
    if (!organizationRole.value && to.params.organizationId) {
      await fetchOrganizationInfo(to.params.organizationId);
    }

    if (organizationRole.value !== "ADMIN") {
      alert("관리자만 접근 가능한 페이지입니다.");
      return next("/403");
    }
  }

  next();
});

export default router;
