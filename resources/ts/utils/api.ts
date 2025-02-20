import { ofetch } from 'ofetch';

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  credentials: 'include', // Ensures token is sent
  async onRequest({ options }) {
    // const accessToken = useCookie('accessToken').value
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  },
})
