import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/BoardEditPage.css";

// ---- 데모 데이터 -------------------------------------------------
const MOCK_POSTS = [
  { id: 1, category: "MATCH", title: "나랑 룸메할 사람?", content: "나랑 룸메할 사람 있어?", createdAt: "2025-09-09T13:00:00" },
  { id: 2, category: "FREE",  title: "자유글 예시",      content: "자유게시판 내용",       createdAt: "2025-09-09T13:05:00" },
];
// ----------------------------------------------------------------

export default function BoardEditPage() {
  const { cat, id } = useParams();             // cat: notice|free|matching|find-roommate (슬러그는 여기선 안 씀)
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 데모: id로 MOCK_POSTS에서 찾기
  useEffect(() => {
    setLoading(true);
    setErr("");
    const found = MOCK_POSTS.find((p) => String(p.id) === String(id));
    if (!found) {
      setErr("해당 게시글을 찾을 수 없습니다. (데모)");
    } else {
      setTitle(found.title);
      setContent(found.content);
    }
    setLoading(false);
  }, [id]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해 주세요.");
      return;
    }
    // 데모: 실제 저장 없이 알림만
    alert(`(데모) 수정 완료!\n\n제목: ${title}\n내용: ${content.substring(0, 40)}${content.length > 40 ? "..." : ""}`);
    navigate(`/boards/${cat}/${id}`, { replace: true });
  };

  const onCancel = () => navigate(`/boards/${cat}/${id}`);
  const onDelete = () => {
    if (!window.confirm("(데모) 정말 삭제하시겠어요?")) return;
    alert("(데모) 삭제 완료!");
    navigate(`/boards/${cat}`, { replace: true });
  };

  if (loading) return <div className="be-wrap"><div className="empty">불러오는 중…</div></div>;
  if (err) return <div className="be-wrap"><div className="empty">{err}</div></div>;

  return (
    <div className="be-wrap">
      {/* 상단바 */}
      <header className="be-topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
        <h1>게시판</h1>
        <div className="right-icons">
          <Link to="/messages" className="icon" aria-label="메시지">💬</Link>
          <Link to="/profile" className="icon" aria-label="프로필">👤</Link>
          <button className="icon" aria-label="메뉴">≡</button>
        </div>
      </header>

      {/* 수정 카드 */}
      <form className="be-card" onSubmit={onSubmit}>
        <input
          className="be-title"
          placeholder="제목을 작성해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="be-content"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="be-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>수정 취소</button>
          <button type="submit" className="btn primary">수정</button>
          <button type="button" className="btn danger" onClick={onDelete}>삭제</button>
        </div>
      </form>
    </div>
  );
}
