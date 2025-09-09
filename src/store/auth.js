// 단순 localStorage 기반 토큰 저장소
const ACCESS_KEY = 'dm_access_token';
const REFRESH_KEY = 'dm_refresh_token';
const USER_KEY = 'dm_user';

export const authStore = {
  setTokens({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  getAccessToken() { return localStorage.getItem(ACCESS_KEY) || ''; },
  getRefreshToken() { return localStorage.getItem(REFRESH_KEY) || ''; },
  clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  clearUser() { localStorage.removeItem(USER_KEY); },
  logout() {
    authStore.clearTokens();
    authStore.clearUser();
  }
};
