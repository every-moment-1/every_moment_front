const LS = {
  TOKENS: 'em_tokens',
  USER: 'em_user',
};

export const authStore = {
  getTokens() {
    try { return JSON.parse(localStorage.getItem(LS.TOKENS)) || {}; } catch { return {}; }
  },
  setTokens({ accessToken, refreshToken }) {
    localStorage.setItem(LS.TOKENS, JSON.stringify({ accessToken, refreshToken }));
  },
  getAccessToken() {
    return (this.getTokens().accessToken) || null;
  },
  getRefreshToken() {
    return (this.getTokens().refreshToken) || null;
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem(LS.USER)) || null; } catch { return null; }
  },
  setUser(user) {
    localStorage.setItem(LS.USER, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(LS.TOKENS);
    localStorage.removeItem(LS.USER);
  },
  logout(api) {
    const { refreshToken } = this.getTokens();
    this.clear();
    if (refreshToken && api) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
  },
};
