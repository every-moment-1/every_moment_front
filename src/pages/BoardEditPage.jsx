import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchPostDetail, updatePost } from "../api/posts";   // ✅ deletePost 제거
import "../styles/BoardEditPage.css";

export default function BoardEditPage() {
  const { cat, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");

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

  return (
    <div className="be-wrap">
      <header className="be-topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
        <h1>게시판</h1>
        <div className="right-icons">
          <Link to="/chat" className="icon" aria-label="메시지">💬</Link>
          <Link to="/profile" className="icon" aria-label="프로필">👤</Link>
          <button className="icon" aria-label="메뉴">≡</button>
        </div>
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
