import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./BoardPage.css";

const CATEGORIES = ["자유 게시판", "공지 게시판", "매칭 게시판", "룸메 찾기 게시판"];

// 데모용 더미 데이터
const SEED = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  title: `게시글 제목 ${i + 1}`,
  createdAt: `2025-09-${String((i % 28) + 1).padStart(2, "0")}`,
  category: CATEGORIES[i % CATEGORIES.length],
}));

export default function BoardPage() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  // 검색 + 카테고리 필터
  const filtered = useMemo(() => {
    const byCat = SEED.filter((p) => p.category === activeCat);
    if (!query.trim()) return byCat;
    const q = query.trim().toLowerCase();
    return byCat.filter((p) => p.title.toLowerCase().includes(q));
  }, [activeCat, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered
    .slice((page - 1) * pageSize, page * pageSize)
    .sort((a, b) => b.id - a.id); // NO. 내림차순 보이도록

  const movePrev = () => setPage((p) => Math.max(1, p - 1));
  const moveNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // 상세 보기 이동
  const goDetail = (id) => navigate(`/board/${id}`);

  return (
    <div className="board-wrap">
      {/* 상단 검은 헤더 */}
      <header className="board-topbar">
        <h1>게시판</h1>
        <div className="top-icons">
          <Link to="/messages" className="icon-btn" aria-label="메시지">💬</Link>
          <Link to="/profile" className="icon-btn" aria-label="프로필">👤</Link>
          <button className="icon-btn" aria-label="메뉴">≡</button>
        </div>
      </header>

      {/* 카테고리 + 검색 */}
      <section className="board-controls">
        <div className="chip-row">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${activeCat === c ? "chip-active" : ""}`}
              onClick={() => { setActiveCat(c); setPage(1); }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="search-box">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="검색"
            aria-label="게시글 검색"
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery("")} aria-label="검색어 지우기">
              ×
            </button>
          )}
        </div>
      </section>

      {/* 목록 테이블 */}
      <section className="board-table">
        <div className="table-head">
          <div className="col no">NO.</div>
          <div className="col title">제목</div>
          <div className="col date">작성일</div>
        </div>

        <div className="table-body">
          {pageData.length === 0 ? (
            <div className="empty">게시글이 없습니다.</div>
          ) : (
            pageData.map((row) => (
              <div
                key={row.id}
                className="table-row"
                role="button"
                tabIndex={0}
                onClick={() => goDetail(row.id)}
                onKeyDown={(e) => e.key === "Enter" && goDetail(row.id)}
              >
                <div className="col no">{row.id}</div>
                <div className="col title ellipsis">
                  <Link to={`/board/${row.id}`} onClick={(e)=> e.stopPropagation()}>
                    {row.title}
                  </Link>
                </div>
                <div className="col date">{row.createdAt}</div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="pager">
          <button onClick={movePrev} disabled={page === 1}>&larr; 이전</button>
          <span className="page-indicator">{page} / {totalPages}</span>
          <button onClick={moveNext} disabled={page === totalPages}>다음 &rarr;</button>
        </div>
      </section>

      {/* 작성 버튼 */}
      <Link to="/board/write" className="write-btn">작성</Link>
    </div>
  );
}
