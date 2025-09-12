// src/pages/BoardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useNavigate, useParams } from "react-router-dom";
import "../styles/BoardPage.css";
import { fetchPostsSimple, catToEnum } from "../api/posts";

const CATS = [
  { slug: "free",          label: "자유 게시판",                enum: "FREE"   },
  { slug: "notice",        label: "공지 게시판",                enum: "NOTICE" },
  { slug: "matching",      label: "매칭 게시판",                enum: "MATCH"  },
  { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판",  enum: "FIND"   },
];

export default function BoardPage() {
  const { cat } = useParams();
  const navigate = useNavigate();

  const [name] = useState("Admin");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const current = useMemo(() => CATS.find((c) => c.slug === cat), [cat]);
  const showWrite = useMemo(() => current && current.enum !== "NOTICE", [current]);

  // 잘못된 카테고리면 기본 탭으로 이동
  useEffect(() => {
    if (!current) {
      navigate("/boards/free", { replace: true });
    } else {
      setPage(1);
    }
  }, [current, navigate]);

  // 목록 불러오기
  useEffect(() => {
    if (!current) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");
        setQuery(""); // 탭 전환 시 검색 초기화(원하면 제거)
        const list = await fetchPostsSimple({
          category: catToEnum(current.slug),
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setRows(Array.isArray(list) ? list : []);
        setPage(1);
        setError(""); // 성공 시 에러 초기화
      } catch (e) {
        if (ac.signal.aborted || e?.code === "ERR_CANCELED" || e?.name === "CanceledError") return;
        setError(e?.response?.data?.message || e.message || "목록을 불러오지 못했습니다.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [current]);

  // 검색 필터
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase().trim();
    return rows.filter((p) => (p.title || "").toLowerCase().includes(q));
  }, [rows, query]);

  // 정렬 → 페이지네이션 (최신 id 우선)
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => Number(b.id) - Number(a.id)),
    [filtered]
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize]
  );

  // 번호 계산
  const startIndex = (page - 1) * pageSize;
  const top = sorted.length - startIndex; // 이 페이지의 첫 글 번호(가장 큼)

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
    return v ?? "";
  };

  return (
    <div className="bp-wrap">
      {/* 상단 헤더 */}
      <header className="bp-topbar">
        <button
          className="back-btn"
          aria-label="뒤로가기"
          onClick={() => {
            navigate("/main");
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

        <h1 className="topbar-title">게시판</h1>

        <nav className="top-icons">
          <Link to="/chat" className="icon-btn" aria-label="메시지">
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
          {showWrite && (
            <Link className="write-btn" to={`/boards/${current?.slug || "free"}/write`}>
              작성
            </Link>
          )}

          <div className="search">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="검색"
              aria-label="검색"
            />
            {query && (
              <button className="clear" onClick={() => setQuery("")} aria-label="지우기">
                ×
              </button>
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
          pageData.map((row, idx) => (
            <div key={row.id} className="row">
              {/* 전통 번호: 최신이 가장 큰 번호 */}
              <div className="no">{top - idx}</div>

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
        <button onClick={prev} disabled={page === 1}>
          ← 이전
        </button>
        <span className="page">
          {page} / {totalPages}
        </span>
        <button onClick={next} disabled={page === totalPages}>
          다음 →
        </button>
      </footer>
    </div>
  );
}
