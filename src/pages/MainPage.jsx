import React from "react";   
import { Link } from "react-router-dom";
import "./MainPage.css";

/**
 * props (선택):
 * - surveyDone: boolean           // 설문조사 완료 여부
 * - matchStatus: "done" | "pending" | "none"  // 매칭 상태
 * - nickname: string              // 우상단 프로필 표시용
 */
export default function MainPage({
  surveyDone = false,
  matchStatus = "pending",
  nickname = "Guest",
}) {
  const matchText =
    matchStatus === "done"
      ? "룸메이트 매칭 완료"
      : matchStatus === "pending"
      ? "룸메이트 매칭 대기 중"
      : "매칭 없음";

  return (
    <div className="main-wrap">
      {/* 헤더 */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          everymoment
        </div>
        <nav className="top-actions">
          <Link to="/messages" aria-label="메시지" className="icon-btn">
            {/* 채팅 말풍선 아이콘 (SVG) */}
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
            </svg>
          </Link>
          <Link to="/profile" className="profile-chip">
            <span className="avatar" aria-hidden>👤</span>
            <span className="nickname">{nickname}</span>
          </Link>
          <button className="icon-btn menu-btn" aria-label="메뉴">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </header>

      {/* 히어로 + 현황 */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="title">everymoment는</h1>
          <p className="subtitle">
            생활패턴 분석을 통해<br />기숙사 룸메이트 매칭 시스템을 제공합니다.
          </p>
          <Link to="/survey" className="cta-btn">설문조사</Link>
        </div>

        <aside className="status-card" aria-label="나의 매칭 현황">
          <h2>나의 매칭 현황</h2>
          <ul>
            <li>
              <span>설문조사</span>
              <strong className={surveyDone ? "ok" : "warn"}>
                {surveyDone ? "완료" : "미완료"}
              </strong>
            </li>
            <li>
              <span>룸메이트 매칭</span>
              <strong className={matchStatus === "done" ? "ok" : "info"}>
                {matchText}
              </strong>
            </li>
          </ul>
          {!surveyDone && (
            <Link to="/survey" className="ghost-btn">지금 설문 완료하기</Link>
          )}
        </aside>
      </section>

      {/* 게시판 섹션 */}
      <section className="boards">
        <h2>게시판</h2>

        <div className="board-list">
          <Link to="/boards/notice" className="board-item">
            <span className="bi-emoji" role="img" aria-label="공지">📢</span>
            <span>공지 게시판</span>
          </Link>

          <Link to="/boards/free" className="board-item">
            <span className="bi-emoji" role="img" aria-label="자유">💬</span>
            <span>자유 게시판</span>
          </Link>

          <Link to="/boards/matching" className="board-item">
            <span className="bi-emoji" role="img" aria-label="매칭">🏠</span>
            <span>매칭 게시판</span>
          </Link>

          <Link to="/boards/find-roommate" className="board-item">
            <span className="bi-emoji" role="img" aria-label="룸메 찾기">🤝</span>
            <span>매칭 없이 룸메 찾기 게시판</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
