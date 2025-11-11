import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "@/utils/auth";
import HomeView from '@/views/HomeView.vue';
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
import OrganizationDashboard from '@/views/dashboard/OrganizationDashboard.vue';
import AdminRoomDetail from '@/views/room/AdminRoomDetail.vue';

import LoginView from "@/views/LoginView.vue";
import SignupView from "@/views/SignupView.vue";
import OAuthCallbackView from "@/views/OAuthCallbackView.vue";
import OrganizationView from "@/views/OrganizationView.vue";
import OrganizationJoinView from "@/views/OrganizationJoinView.vue";



const routes = [
    {path: '/test/common', component: CommonTestView},
    {path: '/test/sidebar', component: SidebarTestView},
    {path: '/test/modar', component: ModalTestView},
    {path: '/test/orgcard', component: OrganizationListTestView},

    /* 관리자메뉴 회의실 관리페이지 */
    {path: '/adminroomlist', component: AdminRoomPage},
    {path: '/adminroomdetail', component: AdminRoomDetail},

    /* 피그마용 삭제예정 */
    {path: '/adminreservation', component: AdminReservationPage},
    {path: '/userhome', component: userhome},

    { path: '/reservation', component: ReservationPage },
    { path: '/reservation/:roomId', component: RoomDetail },

    { path: '/dashboard', component: OrganizationDashboard },

    {path: '/', component: HomeView},
    {path: '/home', component: HomeView},
    {path: '/auth/login', component: LoginView, meta: { requiresGuest: true }},
    {path: '/auth/signup', component: SignupView, meta: { requiresGuest: true }},
    {path: '/oauth/callback', component: OAuthCallbackView},
    {path: '/organization', component: OrganizationView},
    {path: '/organization/join', component: OrganizationJoinView}
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 라우터 가드
router.beforeEach((to, _from, next) => {
  const authenticated = isAuthenticated()

  // 인증이 필요한 페이지
  if (to.meta.requiresAuth && !authenticated) {
    next('/auth/login')
  }
  // 비로그인 사용자만 접근 가능한 페이지 (로그인, 회원가입 등)
  else if (to.meta.requiresGuest && authenticated) {
    next('/organizations/empty')
  }
  else {
    next()
  }
})

export default router;