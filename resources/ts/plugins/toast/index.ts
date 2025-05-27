import type { App } from 'vue'
import Toast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css'

export default function (app: App) {
  app.use(Toast, {
    position: 'top-right',
    duration: 5000,
  })
} 
