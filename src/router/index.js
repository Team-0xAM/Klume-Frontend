import { createRouter, createWebHistory } from "vue-router";
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

const routes = [
    {path: '/', component: HomeView},
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
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;