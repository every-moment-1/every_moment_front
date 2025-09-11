import React, { useEffect, useState } from "react";
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

  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  useEffect(() => {
    if (!current) navigate("/boards/notice/write", { replace: true });
  }, [current, navigate]);

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
        category: catToEnum(cat),           // ✅ posts.js의 매핑 사용
        title: title.trim(),
        content: content.trim(),
      };

      const saved = await createPostSimple(payload); // ✅ axios 직접 호출 대신 API 함수
      const id = saved?.id ?? saved?.data?.id;       // 안전 추출

      if (id) navigate(`/boards/${cat}/${id}`, { replace: true });
      else    navigate(`/boards/${cat}`, { replace: true });
    } catch (e) {
      // 401이면 로그인으로
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

  if (!current) return null;

  return (
    <div className="bw-wrap">
      <header className="bw-topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1>게시판</h1>
        <div className="right-icons">
          <Link to="/chat" className="icon" aria-label="메시지">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" fill="currentColor" />
            </svg>
          </Link>
          <Link to="/profile" className="icon" aria-label="프로필">👤</Link>
          <button className="icon" aria-label="메뉴">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
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
          <button type="submit" className="bw-submit" disabled={loading}>
            {loading ? "업로드 중…" : "업로드"}
          </button>
        </form>
      </div>
    </div>
  );
}
