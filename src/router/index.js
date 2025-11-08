import { createRouter, createWebHistory } from "vue-router";
import HomeView from '@/views/HomeView.vue';
import CommonTestView from "@/views/test/CommonTestView.vue";
import SidebarTestView from '@/views/test/SidebarTestView.vue'
import ModalTestView from "@/views/test/ModalTestView.vue";
import OrganizationListTestView from "@/views/test/OrganizationListTestView.vue";


const routes = [
    {path: '/', component: HomeView},
    {path: '/test/common', component: CommonTestView},
    {path: '/test/sidebar', component: SidebarTestView},
    {path: '/test/modar', component: ModalTestView},
    {path: '/test/orgcard', component: OrganizationListTestView}
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;