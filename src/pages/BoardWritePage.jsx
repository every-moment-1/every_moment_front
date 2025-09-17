import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { createPostSimple, catToEnum } from "../api/posts";   // ✅ posts API 사용
import "../styles/BoardWritePage.css";

const CATS = [
  { slug: "notice", label: "공지 게시판", enum: "NOTICE" },
  { slug: "free", label: "자유 게시판", enum: "FREE" },
  { slug: "matching", label: "매칭 게시판", enum: "MATCH" },
  { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판", enum: "FIND" },
];

export default function BoardWritePage() {
  const { cat } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const current = CATS.find((c) => c.slug === cat);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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

  useEffect(() => {
    if (!current) navigate("/boards/notice/write", { replace: true });
  }, [current, navigate]);

  // ✅ 일반 업로드 (항상 NORMAL)
  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        category: catToEnum(cat),
        title: title.trim(),
        content: content.trim(),
        status: "NORMAL",   // 일반 업로드는 무조건 NORMAL
      };

      const saved = await createPostSimple(payload);
      const id = saved?.id ?? saved?.data?.id;

      if (id) navigate(`/boards/${cat}/${id}`, { replace: true });
      else navigate(`/boards/${cat}`, { replace: true });
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate("/login", { replace: true, state: { from: location } });
        return;
      }
      const msg = e?.response?.data?.message || e?.message || "업로드에 실패했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 스왑 신청 업로드 (매칭 전용)
  const submitSwap = async () => {
    setErr("");

    const fixedTitle = "스왑 신청 합니다";
    setTitle(fixedTitle);

    if (!content.trim()) {
      alert("사유(내용)를 작성해주세요.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        category: catToEnum(cat),
        title: fixedTitle,
        content: content.trim(),
        status: "SWAP_REQUEST",   // 스왑 신청
      };

      const saved = await createPostSimple(payload);
      const id = saved?.id ?? saved?.data?.id;

      if (id) navigate(`/boards/${cat}/${id}`, { replace: true });
      else navigate(`/boards/${cat}`, { replace: true });
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate("/login", { replace: true, state: { from: location } });
        return;
      }
      const msg = e?.response?.data?.message || e?.message || "스왑 신청에 실패했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

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
          .catch(() => {});
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

  if (!current) return null;

  return (
    <div className="bw-wrap">
      <header className="bw-topbar">
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

      <div className="write-form">
        <div className="bw-category">{current.label} 글 작성</div>

        <form className="bw-card" onSubmit={submit}>
          <input
            className="bw-title"
            placeholder="제목을 작성해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <textarea
            className="bw-content"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          {err && <div className="bw-error">{err}</div>}

          {/* ✅ 버튼 영역 (업로드 / 스왑 신청 분리) */}
          <div className="btn-group">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "업로드 중…" : "업로드"}
            </button>

            {cat === "matching" && (
              <button
                type="button"
                className="btn ghost"
                onClick={submitSwap}
                disabled={loading}
              >
                스왑 신청
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
