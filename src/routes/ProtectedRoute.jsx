import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authStore } from '../store/auth';

export default function ProtectedRoute({ children }) {
  // 쿠키 모드라면 서버에서 401을 줄 수도 있으니,
  // 여긴 일단 클라이언트 측 빠른 가드용(토큰 존재 여부)으로 사용
  const token = authStore.getAccessToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}
