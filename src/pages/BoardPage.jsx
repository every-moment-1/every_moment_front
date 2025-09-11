// src/pages/BoardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useNavigate, useParams } from "react-router-dom";
import "../styles/BoardPage.css";

// ✅ 추가: 게시판 API 래퍼
import { fetchPostsSimple, catToEnum } from "../api/posts";

const CATS = [
  { slug: "free", label: "자유 게시판", enum: "FREE" },
  { slug: "notice", label: "공지 게시판", enum: "NOTICE" },
  { slug: "matching", label: "매칭 게시판", enum: "MATCH" },
  { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판", enum: "FIND" },
];

export default function BoardPage() {
  const { cat } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [name] = useState("Admin");

  const [rows, setRows] = useState([]);           // ✅ 목록 상태
  const [loading, setLoading] = useState(true);   // ✅ 로딩/에러
  const [error, setError] = useState("");

  const current = CATS.find((c) => c.slug === cat);

  // 잘못된 카테고리 접근 시 기본값으로 이동
  useEffect(() => {
    if (!current) navigate("/boards/free", { replace: true }); // 경로 통일
    else setPage(1);
  }, [cat]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWrite = () => {
    navigate(`/board/${cat}/write`);
  };

  useEffect(() => {
    if (!current) return;
    const ctrl = new AbortController();
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const catEnum = catToEnum(current.slug);
        console.log('[BoardPage] fetching', { slug: current.slug, catEnum });

        const data = await fetchPostsSimple({
          category: catEnum,
          signal: ctrl.signal,   // axios/fetch가 취소 인지
        });

        if (!mounted || ctrl.signal.aborted) return;

        const list = Array.isArray(data) ? data
          : Array.isArray(data?.content) ? data.content
            : [];
        setRows(list);
        setPage(1);
      } catch (e) {
        // 👇 취소는 에러 표시하지 않음
        const name = e?.name || e?.code;
        const isCanceled =
          name === 'CanceledError' || name === 'AbortError' ||
          e?.message?.includes('canceled') || e?.message?.includes('aborted');
        if (isCanceled || ctrl.signal.aborted || !mounted) return;

        console.error('[BoardPage] fetch error:', e);
        const msg = e?.response?.data?.message || e?.message || "목록을 불러오지 못했습니다.";
        setError(msg);
      } finally {
        if (mounted && !ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [current?.slug]);

  // ✅ 검색/페이지네이션(클라이언트)
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase().trim();
    return rows.filter((p) => (p.title || "").toLowerCase().includes(q));
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered
    .slice((page - 1) * pageSize, page * pageSize)
    .sort((a, b) => Number(b.id) - Number(a.id));

  const prev = () => setPage((p) => Math.max(1, p - 1));
  const next = () => setPage((p) => Math.min(totalPages, p + 1));

  const fmt = (v) => {
    const d = new Date(v);
    if (!isNaN(d)) {
      return d.toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return v ?? ""; // 백엔드가 이미 "MM/DD HH:mm" 형식이면 그대로 표시
  };

  return (
    <div className="bp-wrap">
      {/* 상단 헤더 */}
      <header className="bp-topbar">
        <Link to="/main" className="back-btn" aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="topbar-title">게시판</h1>
        <nav className="top-icons">
          <Link to="/messages" className="icon-btn" aria-label="메시지">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
            </svg>
          </Link>
          <Link to="/profile" className="profile-chip">
            <span className="showname">{name}</span>
          </Link>
          <button className="icon-btn" aria-label="메뉴">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </header>

      {/* 탭 + 작성/검색 */}
      <div className="bp-controls">
        <nav className="tabs">
          {CATS.map((c) => (
            <NavLink
              key={c.slug}
              to={`/boards/${c.slug}`}
              className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
              onClick={() => setQuery("")}
            >
              {c.label}
            </NavLink>
          ))}
        </nav>

        <div className="bar-row">
          {/* <Link className="write-btn" to={`/boards/${current?.slug || "free"}/write`}>
            작성
          </Link> */}
          {/* 공지(notice)가 아닐 때만 표시 */}
          {current?.slug !== "notice" && (
            <Link className="write-btn" to={`/boards/${current?.slug || "free"}/write`}>
              작성
            </Link>
          )}

          <div className="search">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="검색"
              aria-label="검색"
            />
            {query && (
              <button className="clear" onClick={() => setQuery("")} aria-label="지우기">×</button>
            )}
          </div>
        </div>
      </div>

      {/* 목록 */}
      <section className="bp-list">
        {loading ? (
          <div className="empty">불러오는 중…</div>
        ) : error ? (
          <div className="empty">{error}</div>
        ) : pageData.length === 0 ? (
          <div className="empty">게시글이 없습니다.</div>
        ) : (
          pageData.map((row) => (
            <div key={row.id} className="row">
              <div className="no">{row.id}</div>
              <div className="title">
                <Link to={`/boards/${current.slug}/${row.id}`}>{row.title}</Link>
              </div>
              <div className="date">{fmt(row.createdAt)}</div>
            </div>
          ))
        )}
      </section>

      {/* 페이지네이션 */}
      <footer className="bp-pager">
        <button onClick={prev} disabled={page === 1}>← 이전</button>
        <span className="page">{page} / {totalPages}</span>
        <button onClick={next} disabled={page === totalPages}>다음 →</button>
      </footer>
    </div>
  );
}
