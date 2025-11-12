// --- Vue Router 기본 ---
import { createRouter, createWebHistory } from "vue-router";

// --- 인증 / 권한 관련 ---
import { isAuthenticated } from "@/utils/auth";
import { organizationRole, fetchOrganizationInfo } from "@/composables/useOrganization.js";

// --- 공용 뷰 ---
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import SignupView from "@/views/SignupView.vue";
import OAuthCallbackView from "@/views/OAuthCallbackView.vue";

// --- 조직 관련 뷰 ---
import OrganizationView from "@/views/OrganizationView.vue";
import OrganizationCreateView from "@/views/OrganizationCreateView.vue";
import OrganizationJoinWithCodeView from "@/views/OrganizationJoinWithCodeView.vue";

// --- 채팅 및 공지 ---
import ChatRoomListView from "@/views/ChatRoomListView.vue";
import ChatView from "@/views/ChatView.vue";
import NoticeAdminPageView from "@/views/NoticeAdminPageView.vue";

// --- 레이아웃 및 관리자 뷰 ---
import OrganizationLayout from "@/components/layout/OrganizationLayout.vue";
import OrganizationDashboard from "@/views/organization/OrganizationDashboard.vue";
import MyReservationView from "@/views/organization/MyReservationView.vue";
import NoticeView from "@/views/organization/NoticeView.vue";
import RoomManage from "@/views/organization/admin/RoomManage.vue";
import ReservationManage from "@/views/organization/admin/ReservationManage.vue";
import OrganizationManageView from "@/views/organization/admin/OrganizationManageView.vue";

// --- 예약 / 회의실 관련 ---
import MeetingRoomList from "@/components/room/MeetingRoomList.vue";
import AdminRoomPage from "@/views/room/AdminRoomPage.vue";
import AdminRoomDetail from "@/views/room/AdminRoomDetail.vue";
import AdminReservationPage from "@/views/adminreservation/AdminReservationPage.vue";
import ReservationPage from "@/views/reservation/ReservationPage.vue";
import RoomDetail from "@/views/reservation/RoomDetail.vue";

// --- 대시보드 (조직 외부용) ---
import DashboardMain from "@/views/dashboard/OrganizationDashboard.vue";

// --- 테스트 뷰 ---
import CommonTestView from "@/views/test/CommonTestView.vue";
import SidebarTestView from "@/views/test/SidebarTestView.vue";
import ModalTestView from "@/views/test/ModalTestView.vue";
import OrganizationListTestView from "@/views/test/OrganizationListTestView.vue";
import userhome from "@/views/test/userhome.vue";

// --- 에러 / 예외 뷰 ---
import ForbiddenView from "@/views/error/ForbiddenView.vue";


// --- Routes 설정 ---
const routes = [
  // 공용
  { path: "/home", component: HomeView },
  { path: "/", redirect: "/home" },
  { path: "/auth/login", component: LoginView, meta: { requiresGuest: true } },
  { path: "/auth/signup", component: SignupView, meta: { requiresGuest: true } },
  { path: "/oauth/callback", component: OAuthCallbackView },

  // 조직 관련
  { path: "/organization", component: OrganizationView, meta: { requiresAuth: true } },
  { path: "/organization/create", component: OrganizationCreateView, meta: { requiresAuth: true } },
  { path: "/organization/join", component: OrganizationJoinWithCodeView, meta: { requiresAuth: true } },

  // 조직 내부 라우트
  {
    path: "/organization/:organizationId",
    component: OrganizationLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "OrganizationDashboard", component: OrganizationDashboard },
      { path: "reserve", name: "ReservationPage", component: ReservationPage },
      { path: "my-reservations", name: "MyReservationPage", component: MyReservationView },
      { path: "notices", name: "NoticePage", component: NoticeView },
      { path: "dashboard", name: "OrganizationDashboardExternal", component: DashboardMain },
      { path: "chat", name: "ChatRoomList", component: ChatRoomListView },
      { path: "chat/:roomId", name: "ChatRoom", component: ChatView },
      {
        path: "admin/reservations",
        name: "AdminReservationManage",
        component: ReservationManage,
        meta: { requiresAdmin: true },
      },
      {
        path: "admin/rooms",
        name: "AdminRoomManage",
        component: RoomManage,
        meta: { requiresAdmin: true },
      },
      {
        path: "admin/rooms/:roomId",
        name: "AdminRoomDetail",
        component: AdminRoomDetail,
        meta: { requiresAdmin: true },
      },
      {
        path: "admin/organization",
        name: "OrganizationManage",
        component: OrganizationManageView,
        meta: { requiresAdmin: true },
      },
    ],
  },

  // 관리자 공지
  { path: "/organization/:organizationId/admin/notices", component: NoticeAdminPageView },

  // 회의실 / 예약 관련
  { path: "/roomlist", component: MeetingRoomList },
  { path: "/adminroomlist", component: AdminRoomPage },
  { path: "/adminroomdetail", component: AdminRoomDetail },
  { path: "/adminreservation", component: AdminReservationPage },
  { path: "/reservation", component: ReservationPage },
  { path: "/reservation/:roomId", component: RoomDetail },

  // 외부 대시보드
  { path: "/dashboard", component: DashboardMain },

  // 테스트
  { path: "/userhome", component: userhome },
  { path: "/test/common", component: CommonTestView },
  { path: "/test/sidebar", component: SidebarTestView },
  { path: "/test/modal", component: ModalTestView },
  { path: "/test/orgcard", component: OrganizationListTestView },

  // 예외
  { path: "/403", name: "Forbidden", component: ForbiddenView },
];


// --- Router 생성 ---
const router = createRouter({
  history: createWebHistory(),
  routes,
});


// --- 라우터 가드 ---
router.beforeEach(async (to, from, next) => {
  const authenticated = isAuthenticated();

  // 로그인 필요한 페이지 접근 시
  if (to.meta.requiresAuth && !authenticated) {
    return next("/auth/login");
  }

  // 로그인 상태에서 비로그인 페이지 접근 방지
  if (to.meta.requiresGuest && authenticated) {
    return next("/home");
  }

  // 관리자 전용 접근 제어
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
