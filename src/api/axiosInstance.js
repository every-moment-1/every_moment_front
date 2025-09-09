import axios from 'axios';
import { authStore } from '../store/auth';

// 환경에 맞게 수정 (예: import.meta.env.VITE_API_BASE_URL)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // HttpOnly 쿠키를 쓰는 경우 필요
  timeout: 10_000,
});

/** 백엔드가 어디에 토큰을 주는지 선택 */
const TOKEN_MODE = {
  // 'cookie': 서버가 HttpOnly 쿠키로 액세스/리프레시를 관리
  // 'json': 로그인 응답 JSON에 accessToken/refreshToken이 들어옴
  type: 'json',
  accessHeader: 'Authorization',   // Bearer 토큰 헤더명
  refreshEndpoint: '/auth/refresh' // 토큰 재발급 엔드포인트
};

// 요청 인터셉터: json 모드일 때 Authorization 헤더 자동 첨부
api.interceptors.request.use((config) => {
  if (TOKEN_MODE.type === 'json') {
    const at = authStore.getAccessToken();
    if (at) config.headers[TOKEN_MODE.accessHeader] = `Bearer ${at}`;
  }
  return config;
});

// 응답 인터셉터: 401이면 자동 갱신 시도
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (!response) throw error;

    // 이미 한 번 재시도한 요청은 무한루프 방지
    if (response.status === 401 && !config._retry) {
      config._retry = true;

      try {
        if (!refreshing) {
          refreshing = (async () => {
            if (TOKEN_MODE.type === 'json') {
              // JSON 모드: refreshToken으로 재발급
              const rt = authStore.getRefreshToken();
              if (!rt) throw new Error('No refresh token');
              const r = await axios.post(
                `${api.defaults.baseURL}${TOKEN_MODE.refreshEndpoint}`,
                { refreshToken: rt },
                { withCredentials: true }
              );
              const { accessToken, refreshToken, user } = r.data || {};
              if (!accessToken) throw new Error('No access token on refresh');
              authStore.setTokens({ accessToken, refreshToken });
              if (user) authStore.setUser(user);
              return accessToken;
            } else {
              // 쿠키 모드: 서버가 쿠키로 재발급
              await axios.post(
                `${api.defaults.baseURL}${TOKEN_MODE.refreshEndpoint}`,
                {},
                { withCredentials: true }
              );
              // 쿠키 모드는 헤더 토큰이 없으니 그대로 진행
              return 'cookie-mode';
            }
          })();
        }
        const newAccess = await refreshing;
        refreshing = null;

        // 원요청 재시도
        if (TOKEN_MODE.type === 'json' && newAccess) {
          config.headers[TOKEN_MODE.accessHeader] = `Bearer ${newAccess}`;
        }
        return api(config);
      } catch (e) {
        refreshing = null;
        authStore.logout();
        // 선택: 로그아웃 엔드포인트 호출
        // await api.post('/auth/logout').catch(()=>{});
        throw e;
      }
    }
    throw error;
  }
);

export default api;
