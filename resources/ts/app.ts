import i18n from '@/plugins/i18n'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(i18n)
app.mount('#app') 
