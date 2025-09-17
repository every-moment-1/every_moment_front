import api from "./axiosInstance";

/**
 * Vite proxy 규칙(현재 고정):
 * - 특수: /api/posts | /api/comments | /api/chat/rooms → 백엔드 /api/... (rewrite 없음)
 * - 그 외: /api/* 는 맨 앞 /api 가 제거되어 백엔드 루트로 전달됨
 *
 * 백엔드 컨트롤러는 /api/school/* 이므로,
 * 프론트에서 /api/school/* 로 호출해
 *   프론트 최종경로:   /api/api/school/*
 *   프록시 rewrite 후:  /api/school/*   (백엔드와 정확히 일치)
 */

export async function fetchMyProfile() {
  // 프런트: /api/api/school/user → 백엔드: /api/school/user
  const res = await api.get("/api/school/user");
  return res?.data?.data ?? res?.data;
}

export async function updateMyName(username) {
  const res = await api.put("/api/school/user", { username });
  return res?.data?.data ?? res?.data;
}

// 인증(로그인/회원가입/리프레시)도 동일 규칙
export const login    = (body) => api.post("/api/school/auth/login", body);
export const register = (body) => api.post("/api/school/auth/register", body);
// refresh는 axiosInstance에서 인터셉터가 자동 호출하지만, 필요시 직접 호출도 가능
export const refresh  = (body) => api.post("/api/school/auth/refresh", body ?? {});
