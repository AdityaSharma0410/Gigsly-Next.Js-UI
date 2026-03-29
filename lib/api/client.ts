import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

/** Backend for Next.js rewrites (see next.config.ts). Used on the server when no public URL is set. */
const INTERNAL_API_ORIGIN =
  process.env.API_PROXY_TARGET?.replace(/\/$/, '') ||
  process.env.INTERNAL_API_URL?.replace(/\/$/, '') ||
  'http://localhost:9090';

function resolveBaseURL(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    // Browser: same-origin `/api/*` → proxied to gateway (avoids CORS when dev runs on :3001, etc.)
    return '';
  }
  return INTERNAL_API_ORIGIN;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — base URL + auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = resolveBaseURL();
    const token = Cookies.get('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
