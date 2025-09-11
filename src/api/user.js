// src/api/user.js
import api from "./axiosInstance";

/**
 * 내 프로필 조회
 * 프록시 설정(vite.config.js) 때문에 프론트에서 /api/user로 호출하면
 * 실제로는 백엔드의 /api/school/user로 전달됩니다.
 */
export async function fetchMyProfile() {
  const res = await api.get("/user");
  // 백엔드 응답이 BaseResponse<UserDTO> 형태라면 res.data.data 안에 들어있음
  return res?.data?.data ?? res?.data;
}

export async function updateMyName(username) {
  const res = await api.put("/user", { username });
  return res?.data?.data ?? res?.data;
}
