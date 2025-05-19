import { createApp } from 'vue'

// import axios from '../js/axios' // Importe the configured Axios instance
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core-scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// Suppress Suspense experimental warning
app.config.warnHandler = (msg) => {
  if (msg.includes('Suspense') && msg.includes('experimental'))
    return
  console.warn(msg)
}

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')

// console.log(axios.defaults.baseURL)
