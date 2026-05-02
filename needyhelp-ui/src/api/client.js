import axios from 'axios';

export const API_BASE = 'https://localhost:4000';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send refresh-token cookie
});

// In-memory access token (deliberately NOT in localStorage)
let accessToken = null;
let onUnauthorized = () => {};

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const setOnUnauthorized = (fn) => { onUnauthorized = fn; };

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Single-flight refresh: queue parallel 401s behind one refresh call
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Refresh ONLY on 401 (token missing/expired). 403 = role/permission denied,
    // which a refresh can't fix and must surface to the caller as-is.
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/v1/user/refresh') &&
      !original.url?.includes('/v1/user/login') &&
      !original.url?.includes('/v1/user/signup')
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .get(`${API_BASE}/v1/user/refresh`, { withCredentials: true })
            .finally(() => { refreshPromise = null; });
        }
        const { data } = await refreshPromise;
        accessToken = data.accessToken;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (e) {
        accessToken = null;
        onUnauthorized();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
