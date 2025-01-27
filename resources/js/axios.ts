// resources/js/axios.ts
import axios from 'axios'

// Set base URL for Axios requests based on environment
axios.defaults.baseURL = import.meta.env.MODE === 'development'
  ? 'http://127.0.0.1:8000/api'
  : 'https://stephandouglasduval.com/api'

export default axios
