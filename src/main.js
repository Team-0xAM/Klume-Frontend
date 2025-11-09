import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index.js';

console.log('🚀 Creating Vue app...');
const app = createApp(App);

app.use(router);
console.log('🎯 Mounting Vue app...');
app.mount('#app');
console.log('✅ Vue app mounted successfully');