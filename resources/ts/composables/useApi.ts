export function useApi() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

  async function request(url: string, options: RequestInit = {}) {
    const accessToken = localStorage.getItem('accessToken')

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

    const response = await fetch(fullUrl, {
      credentials: 'include',
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data, response }
  }

  return {
    api: {
      get: (url: string, options?: RequestInit) => request(url, { ...options, method: 'GET' }),
      post: (url: string, body?: any, options?: RequestInit) => request(url, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined
      }),
      put: (url: string, body?: any, options?: RequestInit) => request(url, {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined
      }),
      delete: (url: string, options?: RequestInit) => request(url, { ...options, method: 'DELETE' }),
    }
  }
}
