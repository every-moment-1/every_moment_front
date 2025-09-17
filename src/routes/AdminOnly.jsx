// src/routes/AdminOnly.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "../store/auth";

export default function AdminOnly({ children }) {
  const user = authStore.getUser();
  if (!user) return <Navigate to="/" replace />;

  // roles / role / authorities 어떤 형태든 ADMIN 포함되면 통과
  const roles = [
    ...(user.roles || []),
    ...(user.authorities || []).map(a => (typeof a === "string" ? a : a?.authority)),
    user.role,
  ].filter(Boolean);

  const isAdmin = roles.some(r => String(r).toUpperCase().includes("ADMIN"));
  if (!isAdmin) return <Navigate to="/main" replace />;

  return children;
}
