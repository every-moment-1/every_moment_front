import api from "./axiosInstance";

// slug → enum
export const catToEnum = (slug) =>
  ({ notice: "NOTICE", free: "FREE", matching: "MATCH", "find-roommate": "FIND" }[slug] || "FREE");

// 목록: GET /api/posts?category=FREE
export async function fetchPostsSimple({ category, signal } = {}) {
  const { data } = await api.get("/posts", {
    params: { category },
    signal,
  });
  // 컨트롤러가 List<PostEntity>를 반환하므로 배열 그대로 온다.
  // BoardPage는 페이지네이션 필요 시 클라이언트에서 임시 처리
  return Array.isArray(data) ? data : [];
}

// 상세: GET /api/posts/{id}
export async function fetchPostDetail(id, { signal } = {}) {
  const { data } = await api.get(`/posts/${id}`, { signal });
  return data;
}

// 작성: POST /api/posts  (body: PostEntity와 호환되는 필드)
export async function createPostSimple({ category, title, content }) {
  // 백엔드가 @RequestBody PostEntity post 를 받으니, 최소 필드 맞춰준다.
  // PostEntity에 author는 서버에서 auth로 채우는 구조.
  const payload = { category, title, content };
  const { data } = await api.post("/posts", payload);
  return data; // 서버가 저장된 PostEntity를 그대로 반환
}

// 삭제: DELETE /api/posts/{id}
export async function deletePost(id) {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
}
