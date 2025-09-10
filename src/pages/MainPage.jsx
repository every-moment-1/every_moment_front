// src/pages/MainPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/MainPage.css";

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
    <div className="mp-wrap">
      {/* 헤더 */}
      <header className="mp-topbar">
        <div className="mp-brand">everymoment</div>
        <nav className="mp-actions">
          <Link to="/messages" aria-label="메시지" className="mp-icon-btn">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </Link>
          <Link to="/profile" className="mp-profile-chip" aria-label="프로필">
            <span className="mp-avatar" aria-hidden>👤</span>
          </Link>
          <button className="mp-icon-btn mp-menu-btn" aria-label="메뉴">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </header>

      {/* 히어로 */}
      <section className="mp-hero">
        <div className="mp-hero-left">
          <h1 className="mp-title">everymoment는</h1>
          <p className="mp-subtitle">
            생활패턴 분석을 통해<br />기숙사 룸메이트 매칭 시스템을 제공합니다.
          </p>
          <Link to="/survey" className="mp-cta-btn">설문조사하러가기</Link>
        </div>

        <aside className="mp-status-card" aria-label="나의 매칭 현황">
          <h2>나의 매칭 현황</h2>
          <ul>
            <li>
              <span>설문조사</span>
              <strong className={surveyDone ? "mp-ok" : "mp-warn"}>
                {surveyDone ? "완료" : "미완료"}
              </strong>
            </li>
            <li>
              <span>룸메이트 매칭</span>
              <strong className={matchStatus === "done" ? "mp-ok" : "mp-info"}>
                {matchText}
              </strong>
            </li>
          </ul>
          {/* 버튼 제거됨 */}
        </aside>
      </section>

      {/* 게시판 */}
      <section className="mp-boards">
        <h2>게시판</h2>
        <div className="mp-board-list">
          <Link to="/boards/notice" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="공지">📣</span>
            <span>공지 게시판</span>
          </Link>
          <Link to="/boards/free" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="자유">💬</span>
            <span>자유 게시판</span>
          </Link>
          <Link to="/boards/matching" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="매칭">🏠</span>
            <span>매칭 게시판</span>
          </Link>
          <Link to="/boards/find-roommate" className="mp-board-item">
            <span className="mp-bi-emoji" role="img" aria-label="룸메 찾기">🤝</span>
            <span>매칭 없이 룸메 찾기 게시판</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
