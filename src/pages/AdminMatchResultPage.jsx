import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "../styles/AdminMatchResultsPage.css"; // ← .adminmatch 스코프 CSS

const PAGE_SIZE = 20;

export default function AdminMatchResultsPage() {
  const navigate = useNavigate();

  // 헤더 메뉴 토글
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

  // 데이터 상태
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("scoreDesc"); // scoreDesc | scoreAsc | status | recent
  const [page, setPage] = useState(0);
  const [rowsRaw, setRowsRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fmtUser = (name, id) => `${name ?? "익명"}(${id ?? "-"})님`;

  // 데이터 로드
  async function load() {
    try {
      setLoading(true);
      setErr("");
      const { data } = await api.get("/api/match/result/admin/current");
      setRowsRaw(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.status === 403
          ? "관리자만 접근 가능합니다. (403)"
          : "매칭 결과를 불러오지 못했습니다.";
      setErr(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // 검색 (매칭ID 제외)
  const filtered = useMemo(() => {
    if (!q.trim()) return rowsRaw;
    const qq = q.trim().toLowerCase();
    return rowsRaw.filter((r) => {
      const parts = [
        r.userName, r.matchUserName, r.roomAssignment, r.status,
        String(r.userId), String(r.matchUserId),
      ].filter(Boolean).map((s) => String(s).toLowerCase());
      return parts.some((p) => p.includes(qq));
    });
  }, [rowsRaw, q]);

  // 정렬
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "scoreAsc":
        arr.sort((a, b) => (a.preferenceScore ?? -1) - (b.preferenceScore ?? -1));
        break;
      case "status": {
        const order = { ACCEPTED: 0, PENDING: 1, REJECTED: 2 };
        arr.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
        break;
      }
      case "recent":
        arr.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case "scoreDesc":
      default:
        arr.sort((a, b) => (b.preferenceScore ?? -1) - (a.preferenceScore ?? -1));
    }
    return arr;
  }, [filtered, sort]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = useMemo(() => {
    const start = page * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  // 상태 배지 클래스
  const badgeClass = (s) =>
    `lp-badge ${
      s === "ACCEPTED" ? "lp-badge-accept" :
      s === "REJECTED" ? "lp-badge-reject" : "lp-badge-pending"
    }`;

  return (
    <div className="adminmatch">
      {/* 헤더 */}
      <header className="profile-topbar">
        <button
          className="back-btn"
          aria-label="뒤로가기"
          onClick={() => navigate("/main")}
          title="뒤로가기"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
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

        <h1 className="topbar-title">관리자 · 매칭 결과</h1>

        <nav className="top-icons" ref={menuRef}>
          <Link to="/chat" aria-label="메시지" className="profile-icon-btn" title="메시지">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Link>

          <Link to="/profile" aria-label="프로필" className="profile-icon-btn" title="프로필">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Link>

          <button
            className="profile-icon-btn"
            aria-label="메뉴"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            title="메뉴"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" stroke="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <ul className="menu-dd" role="menu">
              <li role="menuitem">
                <Link to="/" className="menu-item">로그아웃</Link>
              </li>
            </ul>
          )}
        </nav>
      </header>

      {/* 리스트 섹션 */}
      <section className="lp-admin-list">
        <div className="lp-list-head">
          <h2>유저 매칭 결과</h2>

          {/* 정렬 ▸ 검색 */}
          <div className="lp-head-actions">
            <select
              className="lp-select"
              value={sort}
              onChange={(e) => { setPage(0); setSort(e.target.value); }}
              aria-label="정렬"
            >
              <option value="scoreDesc">점수 높은순</option>
              <option value="scoreAsc">점수 낮은순</option>
              <option value="status">상태순</option>
              <option value="recent">최신순</option>
            </select>

            <input
              className="lp-input"
              placeholder="이름/ID/상태/호실 검색"
              value={q}
              onChange={(e) => { setPage(0); setQ(e.target.value); }}
            />
          </div>
        </div>

        {/* 표 */}
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th className="col-state">상태</th>
                <th className="col-match">매칭</th>
                <th className="col-room">호실</th>
                <th className="col-score">점수</th>
                <th className="col-reasons">매칭 이유(Top3)</th>
              </tr>
            </thead>
            <tbody>
              {(!pageRows || pageRows.length === 0) && (
                <tr>
                  <td colSpan={5} className="lp-empty">
                    {err || (loading ? "불러오는 중..." : "데이터가 없습니다.")}
                  </td>
                </tr>
              )}

              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                  <td>
                    {fmtUser(r.userName, r.userId)}
                    <span className="lp-sep">↔</span>
                    {fmtUser(r.matchUserName, r.matchUserId)}
                  </td>
                  <td>{r.roomAssignment || "-"}</td>
                  <td className="lp-score">
                    {typeof r.preferenceScore === "number" ? r.preferenceScore.toFixed(1) : "-"}
                  </td>
                  <td className="lp-reasons">
                    {Array.isArray(r.matchReasons) && r.matchReasons.length > 0
                      ? r.matchReasons.join(" · ")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이저 */}
        <div className="lp-pager">
          <button
            className="lp-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            이전
          </button>
          <span className="lp-page">{Math.min(page + 1, totalPages)} / {totalPages}</span>
          <button
            className="lp-btn"
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
            disabled={page + 1 >= totalPages}
          >
            다음
          </button>
        </div>
      </section>
    </div>
  );
}
