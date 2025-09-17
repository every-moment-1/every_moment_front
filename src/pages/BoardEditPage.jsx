import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchPostDetail, updatePost } from "../api/posts";   // ✅ deletePost 제거
import "../styles/BoardEditPage.css";


export default function BoardEditPage() {
  const { cat, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

  // 상세 불러오기
  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;

    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await fetchPostDetail(id, { signal: ac.signal });
        if (ignore) return;
        setTitle(data?.title || "");
        setContent(data?.content || "");
      } catch (e) {
        if (ignore) return;
        const msg = e?.response?.data?.message || e.message || "불러오기에 실패했습니다.";
        setErr(msg);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; ac.abort(); };
  }, [id]);

  // 저장(수정)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력하세요.");
      return;
    }
    try {
      setSaving(true);
      await updatePost(id, { title: title.trim(), content: content.trim() });
      navigate(`/boards/${cat}/${id}`, { replace: true });
    } catch (e) {
      // 401이면 로그인으로
      if (e?.response?.status === 401) {
        navigate("/login", { replace: true, state: { from: location } });
        return;
      }
      const msg = e?.response?.data?.message || e.message || "수정에 실패했습니다.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => navigate(`/boards/${cat}/${id}`);

  if (loading) return <div className="be-wrap"><div className="empty">불러오는 중…</div></div>;
  if (err)     return <div className="be-wrap"><div className="empty">{err}</div></div>;

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

  if (loading) return <div className="be-wrap"><div className="empty">불러오는 중…</div></div>;
  if (err) return <div className="be-wrap"><div className="empty">{err}</div></div>;

  return (
    <div className="be-wrap">
      <header className="be-topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
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

      <form className="be-card" onSubmit={onSubmit}>
        <input
          className="be-title"
          placeholder="제목을 작성해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
        />
        <textarea
          className="be-content"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={saving}
        />

        <div className="be-actions">
          <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>수정 취소</button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "저장 중…" : "수정"}
          </button>
          {/* ✅ 삭제 버튼 제거됨 */}
        </div>
      </form>
    </div>
  );
}
