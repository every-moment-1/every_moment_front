import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import "../styles/BoardDetailPage.css";

const CATS = [
  { slug: "notice", label: "공지 게시판", enum: "NOTICE" },
  { slug: "free", label: "자유 게시판", enum: "FREE" },
  { slug: "matching", label: "매칭 게시판", enum: "MATCH" },
  { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판", enum: "FIND" },
];

export default function BoardDetailPage() {
  const { cat, id } = useParams();
  const navigate = useNavigate();
  const currentCat = useMemo(() => CATS.find(c => c.slug === cat), [cat]);

  const [post, setPost] = useState(null);          // PostDetail
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [commentText, setCommentText] = useState("");

  // 상세 불러오기
  async function fetchPost() {
    try {
      setErr("");
      setLoading(true);
      const { data } = await api.get(`/posts/${id}`);
      setPost(data);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "불러오기에 실패했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentCat) {
      navigate("/boards/notice", { replace: true });
      return;
    }
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentCat]);

  // 댓글 작성
  const addComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    try {
      await api.post(`/comments/${id}`, { content: text });
      setCommentText("");
      await fetchPost(); // 새로고침해서 댓글 반영
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "댓글 등록 실패";
      alert(msg);
    }
  };

  // 글 삭제
  const removePost = async () => {
    if (!window.confirm("이 글을 삭제할까요?")) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate(`/boards/${cat}`);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "삭제 실패";
      alert(msg);
    }
  };

  const fmt = (ts) =>
    ts ? new Date(ts).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="bd-wrap">
      <header className="bd-topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1>게시판</h1>
        <div className="right-icons">
          <Link to="/messages" className="icon" aria-label="메시지">
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

      <main className="bd-main">
        {loading && <div className="bd-loading">불러오는 중…</div>}
        {err && <div className="bd-error">{err}</div>}
        {!loading && post && (
          <>
            <div className="bd-card">
              <div className="bd-meta">
                <div className="bd-author">👤 {post.authorName}</div>
                <div className="bd-time">{fmt(post.createdAt)}</div>
                <div className="bd-actions">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => navigate(`/boards/${cat}/${id}/edit`)}
                  >
                    수정
                  </button>
                  <button className="link-btn" onClick={removePost}>삭제</button>
                </div>
              </div>

              <h2 className="bd-title">{post.title}</h2>
              <p className="bd-content">{post.content}</p>
            </div>

            {/* 댓글 리스트 */}
            <section className="bd-comments">
              {(post.comments || []).map((c) => (
                <div key={c.id} className="cmt-block">
                  <div className="cmt-box">
                    <div className="cmt-header">
                      <div className="cmt-author">👤 {c.authorName}</div>
                      <div className="cmt-time">{fmt(c.createdAt)}</div>
                    </div>
                    <div className="cmt-body">{c.content}</div>
                  </div>
                </div>
              ))}
            </section>

            {/* 댓글 작성 */}
            <form className="bd-write" onSubmit={addComment}>
              <textarea
                placeholder="댓글을 입력하세요"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" className="bd-submit">등록</button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
