// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ProfilePage.css";

import { fetchMyProfile, updateMyName } from "../api/user";
import { authStore } from "../store/auth";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 표시 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [smoking, setSmoking] = useState("");

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
                 me.smoking === "NO"  ? "아니요" : (me.smoking ?? ""));
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

  if (loading) return <div className="profile-wrap">불러오는 중…</div>;
  if (err) return <div className="profile-wrap">{err}</div>;

  return (
    <div className="profile-wrap">
      <header className="profile-topbar">
        <Link to="/main" className="back-btn" aria-label="뒤로가기">←</Link>
        <h1 className="topbar-title">마이페이지</h1>
        <nav className="top-icons">
          <Link to="/messages" className="icon-btn" aria-label="메시지">💬</Link>
          <Link to="/profile" className="icon-btn" aria-label="프로필">👤</Link>
          <button className="icon-btn" aria-label="메뉴">≡</button>
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
