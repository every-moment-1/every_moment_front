import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useNavigate, useParams } from "react-router-dom";
import "../styles/BoardPage.css";

// slug ↔ 라벨 ↔ 백엔드 enum
const CATS = [
    { slug: "free", label: "자유 게시판", enum: "FREE" },
    { slug: "notice", label: "공지 게시판", enum: "NOTICE" },
    { slug: "matching", label: "매칭 게시판", enum: "MATCH" },
    { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판", enum: "FIND" },
];

// 데모 데이터 (실서버 연동 전)
const SEED = Array.from({ length: 28 }, (_, i) => {
    const enums = ["FREE", "NOTICE", "MATCH", "FIND"];
    const cat = enums[i % enums.length];
    return {
        id: i + 1,
        title: `게시글 제목 ${i + 1}`,
        category: cat,
        createdAt: "09/09 13:00",
    };
});

export default function BoardPage() {
    const { cat } = useParams();                 // free|notice|match|find
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [name] = useState("Admin");

    const current = CATS.find((c) => c.slug === cat);

    // 잘못된 카테고리 접근 시 기본값으로 이동
    useEffect(() => {
        if (!current) navigate("/board/free", { replace: true });
        else setPage(1);
    }, [cat]); // eslint-disable-line react-hooks/exhaustive-deps

    // 목록 필터링 (카테고리 + 검색)
    const filtered = useMemo(() => {
        if (!current) return [];
        const base = SEED.filter((p) => p.category === current.enum);
        if (!query.trim()) return base;
        const q = query.toLowerCase().trim();
        return base.filter((p) => p.title.toLowerCase().includes(q));
    }, [current, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageData = filtered
        .slice((page - 1) * pageSize, page * pageSize)
        .sort((a, b) => b.id - a.id); // 최신이 위로

    const prev = () => setPage((p) => Math.max(1, p - 1));
    const next = () => setPage((p) => Math.min(totalPages, p + 1));

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
                    <Link className="write-btn" to={`/boards/${current?.slug || "free"}/write`}>작성</Link>

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
                {pageData.length === 0 ? (
                    <div className="empty">게시글이 없습니다.</div>
                ) : (
                    pageData.map((row) => (
                        <div key={row.id} className="row">
                            <div className="no">{row.id}</div>
                            <div className="title">
                                <Link to={`/boards/${current.slug}/${row.id}`}>{row.title}</Link>
                            </div>
                            <div className="date">{row.createdAt}</div>
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
