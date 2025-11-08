import { createRouter, createWebHistory } from "vue-router";
import HomeView from '@/views/HomeView.vue';
import CommonTestView from "@/views/test/CommonTestView.vue";

const routes = [
    {path: '/', component: HomeView},
    {path: '/test/common', component: CommonTestView}
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;