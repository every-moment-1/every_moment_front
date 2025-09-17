// src/pages/ProfilePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";

import { fetchMyProfile, updateMyName } from "../api/user";
import { authStore } from "../store/auth";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // 표시 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [smoking, setSmoking] = useState("");

  // ▼ 메뉴 드롭다운 상태 & 외부 클릭 닫기
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const me = await fetchMyProfile();

        if (me) {
          setName(me.username ?? "");
          setEmail(me.email ?? "");

          // ✅ RegisterPage 규칙에 맞춤: number 0=남성, 1=여성
          const g =
            typeof me.gender === "number"
              ? (me.gender === 0 ? "남성" : me.gender === 1 ? "여성" : "기타")
              : typeof me.gender === "string"
                ? (me.gender === "MALE" ? "남성" :
                  me.gender === "FEMALE" ? "여성" : me.gender)
                : "";
          setGender(g);

          // ✅ smoking: boolean(true=흡연) | 문자열 YES/NO 대응
          const s =
            typeof me.smoking === "boolean"
              ? (me.smoking ? "예" : "아니요")
              : (me.smoking === "YES" ? "예" :
                me.smoking === "NO" ? "아니요" : (me.smoking ?? ""));
          setSmoking(s);
        }
      } catch (e) {
        const s = e?.response?.status;
        if (s === 401) setErr("로그인이 필요합니다. 다시 로그인해 주세요.");
        else setErr("프로필을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateMyName(name.trim());
      authStore.setUser && authStore.setUser(updated);
      setName(updated.username ?? name);
      alert("프로필이 수정되었습니다.");
    } catch {
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // ▼ 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("em_tokens") || "{}");
      const accessToken = tokens?.accessToken;
      const refreshToken = tokens?.refreshToken;

      const base = import.meta.env.VITE_API_BASE ?? "/api";
      if (refreshToken) {
        await api
          .post(
            `${base}/logout`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
            }
          )
          .catch(() => { }); // 서버 실패해도 아래 클린업 진행
      }

      localStorage.removeItem("em_tokens");
      localStorage.removeItem("em_user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userid");
      localStorage.removeItem("memberId");

      try {
        const { authStore } = await import("../store/auth");
        authStore?.logout?.();
      } catch { }

      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  };

  if (loading) return <div className="profile-wrap">불러오는 중…</div>;
  if (err) return <div className="profile-wrap">{err}</div>;

  return (
    <div className="profile-wrap">
      <header className="profile-topbar">
        <button
          className="back-btn"
          aria-label="뒤로가기"
          onClick={() => {
            navigate(-1);
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <h1 className="topbar-title">마이페이지</h1>
        <nav className="top-icons">

          <Link to="/chat" aria-label="메시지" className="mp-icon-btn">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Link>

          <Link to="/profile" className="mp-profile-chip" aria-label="프로필">
            <span className="mp-avatar" aria-hidden>
              👤
            </span>
          </Link>

          {/* ▼ 메뉴 버튼 + 드롭다운 */}
          <div className="mp-menu" ref={menuRef}>
            <button
              className="mp-icon-btn mp-menu-btn"
              aria-label="메뉴"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {menuOpen && (
              <ul className="mp-menu-dd" role="menu">
                <li role="menuitem">
                  <button className="mp-menu-item" onClick={handleLogout}>
                    로그아웃
                  </button>
                </li>
              </ul>
            )}
          </div>

        </nav>
      </header>

      <main className="profile-card">
        <div className="avatar-wrap">
          <div className="avatar-circle" aria-hidden>👤</div>
          <Link to="/survey/result" className="pill-btn">설문조사 결과</Link>
        </div>

        <form className="profile-form" onSubmit={onSubmit}>
          <div className="grid-2">
            <label className="field">
              <span className="label-text">이름</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </label>

            <label className="field">
              <span className="label-text">성별</span>
              <input type="text" value={gender} className="input input-disabled" disabled />
            </label>

            <label className="field">
              <span className="label-text">이메일</span>
              <input type="email" value={email} className="input input-disabled" disabled />
            </label>

            <label className="field">
              <span className="label-text">흡연여부</span>
              <input type="text" value={smoking} className="input input-disabled" disabled />
            </label>
          </div>

          <button type="submit" className="primary-btn">수정</button>
        </form>
      </main>
    </div>
  );
}
