// src/pages/MainPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { authStore } from "../store/auth";         // ✅ 관리자 판별 위해 추가
import "../styles/MainPage.css";

/* ===== 역할 판별 유틸 ===== */
function isAdmin(user) {
  if (!user) return false;
  const roles = [
    ...(user.roles || []),
    ...(user.authorities || []).map(a => (typeof a === "string" ? a : a?.authority)),
    user.role,
  ].filter(Boolean);
  return roles.some(r => String(r).toUpperCase().includes("ADMIN"));
}

export default function MainPage() {
  const navigate = useNavigate();

  // 현재 사용자/관리자 여부
  const user = authStore.getUser?.() || null;
  const admin = isAdmin(user);

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

  // ----------- 서버 상태 (일반 사용자 전용) -----------
  const [surveyDone, setSurveyDone] = useState(false);
  const [matchStatus, setMatchStatus] = useState("none"); // "pending" | "done" | "none"
  const [loading, setLoading] = useState(true);

  // “진짜 불린 true”일 때만 완료로 인정
  const coerceSurveyDone = (v) => v === true;

  // matchStatus 정규화(대소문자/표현차 보정)
  const normalizeMatchStatus = (v) => {
    const t = (v ?? "").toString().trim().toLowerCase();
    if (!t) return "none";
    if (["done", "success", "matched", "accepted", "complete", "completed"].includes(t)) return "done";
    if (["pending", "waiting", "inprogress", "processing"].includes(t)) return "pending";
    if (["none", "na", "unmatched", "rejected", "fail", "failed", "no"].includes(t)) return "none";
    return "none";
  };

  const fetchStatus = async () => {
    // 관리자 화면에서는 호출 안 함
    if (admin) return;

    setLoading(true);
    setSurveyDone(false);
    setMatchStatus("none");

    try {
      const res = await api.get(`/api/school/user/status`, { params: { _: Date.now() } });
      const raw = res?.data?.data ?? res?.data ?? {};
      const surveyRaw = raw?.surveyDone ?? raw?.survey_done ?? raw?.isSurveyDone;
      const matchRaw =
        raw?.matchStatus ?? raw?.matchingStatus ?? raw?.status ?? raw?.match_status ?? raw?.matching_status;

      console.debug("[status raw]", raw);
      console.debug("[surveyRaw]", surveyRaw, "→ strict:", coerceSurveyDone(surveyRaw));
      console.debug("[matchRaw]", matchRaw, "→ norm:", normalizeMatchStatus(matchRaw));

      setSurveyDone(coerceSurveyDone(surveyRaw));
      setMatchStatus(normalizeMatchStatus(matchRaw));
    } catch (e) {
      console.error("Failed to fetch status", e);
      setSurveyDone(false);
      setMatchStatus("none");
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시 조회 (관리자가 아니면)
  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  // 매칭 대기중이면 15초 간격으로 재조회 (관리자가 아니면)
  useEffect(() => {
    if (admin) return;
    if (matchStatus !== "pending") return;
    const id = setInterval(fetchStatus, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, matchStatus]);

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
          .catch(() => {}); // 서버 실패해도 아래 클린업 진행
      }

      localStorage.removeItem("em_tokens");
      localStorage.removeItem("em_user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userid");
      localStorage.removeItem("memberId");

      try {
        const { authStore } = await import("../store/auth");
        authStore?.logout?.();
      } catch {}

      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  };

  // ------------------- 사용자 CTA -------------------
  // - 로딩 중: 비활성 버튼
  // - 설문 완료: 매칭결과 페이지로
  // - 설문 미완료: 설문 페이지로
  const renderUserCTA = () => {
    if (loading) {
      return (
        <button className="mp-cta-btn" disabled aria-busy="true" style={{ opacity: 0.6, cursor: "not-allowed" }}>
          상태 확인 중…
        </button>
      );
    }
    if (surveyDone) {
      return (
        <Link to="/match" className="mp-cta-btn" aria-label="룸메이트 매칭 확인하러가기">
          룸메이트 매칭 확인하러가기
        </Link>
      );
    }
    return (
      <Link to="/survey" className="mp-cta-btn" aria-label="설문조사하러가기">
        설문조사하러가기
      </Link>
    );
  };

  const matchText =
    matchStatus === "done" ? "룸메이트 매칭 성공"
    : matchStatus === "pending" ? "룸메이트 매칭 대기 중"
    : "매칭 없음";

  return (
    <div className="mp-wrap">
      {/* 헤더 */}
      <header className="mp-topbar">
        <div className="mp-brand">everymoment</div>

        <nav className="mp-actions">
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

      {/* 히어로 - 관리자/일반 사용자 분기 */}
      {admin ? (
        // ✅ 관리자: 설문 CTA 없고, 관리자 전용 버튼만 노출
        <section className="mp-hero">
          <div className="mp-hero-left">
            <h1 className="mp-title">everymoment 관리자 페이지</h1>
            <Link to="/admin/matches" className="mp-cta-btn">
              모든 매칭 결과 보러가기
            </Link>
          </div>
          {/* 관리자 화면에서는 개인 상태카드(aside) 숨김 */}
        </section>
      ) : (
        // ✅ 일반 사용자: CTA가 상태에 따라 자동 변경
        <section className="mp-hero">
          <div className="mp-hero-left">
            <h1 className="mp-title">everymoment는</h1>
            <p className="mp-subtitle">
              생활패턴 분석을 통해
              <br />
              기숙사 룸메이트 매칭 시스템을 제공합니다.
            </p>

            {/* 설문/매칭 상태 기반 CTA */}
            {renderUserCTA()}
          </div>

          <aside className="mp-status-card" aria-label="나의 매칭 현황">
            <h2>나의 매칭 현황</h2>

            {loading && (
              <div className="mp-info" style={{ padding: 8, fontSize: 14 }}>
                불러오는 중…
              </div>
            )}

            {!loading && (
              <ul>
                <li>
                  <span>설문조사</span>
                  <strong className={surveyDone ? "mp-ok" : "mp-warn"}>
                    {surveyDone ? "설문조사 완료" : "미완료"}
                  </strong>
                </li>
                <li>
                  <span>룸메이트 매칭</span>
                  <strong className={matchStatus === "done" ? "mp-ok" : "mp-info"}>
                    {matchText}
                  </strong>
                </li>
              </ul>
            )}
          </aside>
        </section>
      )}

      {/* 게시판 (관리자/사용자 공통) */}
      <section className="mp-boards">
        <h2>게시판</h2>
        <div className="mp-board-list">
          <Link to="/boards/notice" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="공지">
              📣
            </span>
            <span>공지 게시판</span>
          </Link>
          <Link to="/boards/free" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="자유">
              💬
            </span>
            <span>자유 게시판</span>
          </Link>
          <Link to="/boards/matching" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="매칭">
              🏠
            </span>
            <span>매칭 게시판</span>
          </Link>
          <Link to="/boards/find-roommate" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="룸메 찾기">
              🤝
            </span>
            <span>매칭 없이 룸메 찾기 게시판</span>
          </Link>
        </div>
      </section>

      {/* 간단 드롭다운 스타일 (필요 시 MainPage.css로 옮겨도 됨) */}
      <style>{`
        .mp-menu { position: relative; display: inline-block; }
        .mp-menu-dd {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
          min-width: 120px; padding: 6px 0; box-shadow: 0 6px 18px rgba(0,0,0,.08);
          z-index: 1000;
        }
        .mp-menu-item {
          width: 100%; text-align: left; background: transparent; border: 0;
          padding: 10px 12px; font-size: 14px; cursor: pointer; color: #111827;
        }
        .mp-menu-item:hover { background: #f3f4f6; }
      `}</style>
    </div>
  );
}
