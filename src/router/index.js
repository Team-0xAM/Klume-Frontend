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

// --- 조직 관련 레이아웃 및 페이지 ---
import OrganizationLayout from "@/components/layout/OrganizationLayout.vue";
import OrganizationDashboard from "@/views/organization/OrganizationDashboard.vue";
import RoomManage from "@/views/organization/admin/RoomManage.vue";
import ReservationManage from "@/views/organization/admin/ReservationManage.vue";
import ForbiddenView from "@/views/error/ForbiddenView.vue"; // 🚫 403 페이지

// --- routes ---
const routes = [
  { path: "/", component: HomeView },
  { path: "/home", component: HomeView },
  { path: "/auth/login", component: LoginView, meta: { requiresGuest: true } },
  { path: "/auth/signup", component: SignupView, meta: { requiresGuest: true } },
  { path: "/oauth/callback", component: OAuthCallbackView },
  { path: "/organization", component: OrganizationView, meta: { requiresAuth: true } },
  { path: "/organization/join", component: OrganizationJoinView, meta: { requiresAuth: true } },

  // ✅ 조직 내부 페이지
  {
    path: "/organization/:organizationId",
    component: OrganizationLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "OrganizationDashboard",
        component: OrganizationDashboard,
      },
      {
        path: "reserve",
        name: "ReservationPage",
        component: {
          template: `
            <div style="padding:40px">
              <h1>회의실 예약 페이지 (ReservationView.vue 예정)</h1>
              <p>추후 실제 예약 페이지로 대체될 예정입니다.</p>
            </div>
          `,
        },
      },
      {
        path: "my",
        name: "MyReservationPage",
        component: {
          template: `
            <div style="padding:40px">
              <h1>내 예약 보기 페이지 (MyReservationView.vue 예정)</h1>
            </div>
          `,
        },
      },
      {
        path: "notice",
        name: "NoticePage",
        component: {
          template: `
            <div style="padding:40px">
              <h1>공지사항 페이지 (NoticeView.vue 예정)</h1>
            </div>
          `,
        },
      },

      // 👑 관리자 전용
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
    ],
  },

  // 🚫 403 접근 권한 없음
  {
    path: "/403",
    name: "Forbidden",
    component: ForbiddenView,
  },
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
