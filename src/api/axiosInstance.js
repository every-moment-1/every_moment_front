import axios from 'axios';
import { authStore } from '../store/auth';

const api = axios.create({
  // 개발: Vite 프록시(/api -> http://localhost:8080/api/school)와 함께 사용
  // 운영: VITE_API_BASE에 백엔드 전체 URL을 넣어 사용
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: false,
  timeout: 10000,
});

// 요청마다 액세스 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const at = authStore.getAccessToken && authStore.getAccessToken();
  if (at) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${at}`;
  }
  return config;
});

let isRefreshing = false;
let subscribers = [];

function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}
function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error?.response?.status;

    // 로그인/회원가입은 토큰 갱신 X
    const isAuth = /\/auth\/(login|register)/.test(original?.url || '');

    if (status === 401 && !isAuth && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            original.headers = original.headers || {};
            if (token) original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const rt = authStore.getRefreshToken && authStore.getRefreshToken();
        if (!rt) throw new Error('No refresh token');

        const resp = await api.post('/auth/refresh', { refreshToken: rt });
        // 백엔드 래퍼 대응: data.data 또는 data
        const payload = resp?.data?.data || resp?.data || {};
        const { accessToken, refreshToken: newRT } = payload;

        if (!accessToken) throw new Error('No accessToken from refresh');

        authStore.setTokens({ accessToken, refreshToken: newRT || rt });
        onRefreshed(accessToken);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (e) {
        authStore.clear && authStore.clear();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;