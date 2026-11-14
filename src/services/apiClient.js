import axios from 'axios'

/**
 * Shared Axios instance for the (future) Node.js / Express backend.
 * Set VITE_API_BASE_URL in a .env file to point every service at the backend
 * without touching any component code.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || 'Network error'
    return Promise.reject(Object.assign(new Error(message), { status, cause: error }))
  },
)

export default apiClient
