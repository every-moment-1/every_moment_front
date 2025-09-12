// src/pages/BoardDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchPostDetail,
  deletePost,
  deleteComment,
  createComment,
} from "../api/posts";
import { authStore } from "../store/auth";
import "../styles/BoardDetailPage.css";

const CATS = [
  { slug: "notice", label: "공지 게시판", enum: "NOTICE" },
  { slug: "free", label: "자유 게시판", enum: "FREE" },
  { slug: "matching", label: "매칭 게시판", enum: "MATCH" },
  { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판", enum: "FIND" },
];

/** JWT payload 파싱 */
function parseJwt(token) {
  try {
    const payload = token?.split(".")[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    return JSON.parse(atob(pad));
  } catch {
    return null;
  }
}

/** authStore + storage에서 현재 로그인 사용자 정보 복구 */
function getAuthSnapshot(store) {
  const me = store?.user || null;
  const t = store?.tokens || {};
  const accessToken =
    t?.accessToken ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    null;

  const payload = accessToken ? parseJwt(accessToken) : null;
  const uid = me?.id ?? payload?.uid ?? null;
  const role = me?.role ?? payload?.role ?? null;
  const username = me?.username ?? null;
  const email = me?.email ?? payload?.sub ?? null;

  return { me, uid, role, username, email, accessToken };
}

/** 작성자 판별 */
function isOwnerOf(item, auth) {
  if (!item) return false;
  if (item.authorId != null && auth.uid != null) {
    return Number(item.authorId) === Number(auth.uid);
  }
  if (item.authorName) {
    return item.authorName === auth.username || item.authorName === auth.email;
  }
  return false;
}

export default function BoardDetailPage() {
  const { cat, id } = useParams();
  const navigate = useNavigate();
  const currentCat = useMemo(() => CATS.find((c) => c.slug === cat), [cat]);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [commentText, setCommentText] = useState("");
  const [deletingCmtId, setDeletingCmtId] = useState(null);

  const auth = getAuthSnapshot(authStore);
  const isAdmin = auth.role === "ROLE_ADMIN";

  // 날짜 포맷
  const fmt = (ts) =>
    ts
      ? new Date(ts).toLocaleString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  // 수정됨 표시 여부
  const isEdited = (createdAt, updatedAt) => {
    if (!createdAt || !updatedAt) return false;
    const c = +new Date(createdAt);
    const u = +new Date(updatedAt);
    return Number.isFinite(c) && Number.isFinite(u) && u !== c;
  };

  // 게시글 불러오기
  async function fetchPost() {
    try {
      setErr("");
      setLoading(true);
      const detail = await fetchPostDetail(id);
      setPost(detail);
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

  // 댓글 등록
  async function addComment(e) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    try {
      await createComment(id, text);
      setCommentText("");
      await fetchPost();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "댓글 등록 실패";
      alert(msg);
    }
  }

  // 댓글 삭제
  async function removeComment(commentId) {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    try {
      setDeletingCmtId(commentId);
      await deleteComment(commentId);
      await fetchPost();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "댓글 삭제 실패";
      alert(msg);
    } finally {
      setDeletingCmtId(null);
    }
  }

  // 글 삭제
  async function removePostHandler() {
    if (!window.confirm("이 글을 삭제할까요?")) return;
    try {
      await deletePost(id);
      navigate(`/boards/${cat}`);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "삭제 실패";
      alert(msg);
    }
  }

  if (loading) return <div className="bd-wrap"><div className="bd-loading">불러오는 중…</div></div>;
  if (err) return <div className="bd-wrap"><div className="bd-error">{err}</div></div>;
  if (!post) return <div className="bd-wrap"><div className="bd-error">게시글을 찾을 수 없습니다.</div></div>;

  const canModifyPost = isAdmin || isOwnerOf(post, auth);

  return (
    <div className="bd-wrap">
      <header className="bp-topbar">
        <button
          className="back-btn"
          aria-label="뒤로가기"
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate(`/boards/${cat}`);
          }}
        >
          ←
        </button>
        <h1 className="topbar-title">게시판</h1>
        <nav className="top-icons">
          <Link to="/messages" className="icon-btn" aria-label="메시지">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
            </svg>
          </Link>
          <Link to="/profile" className="profile-chip">
            <span className="showname">{auth.username || auth.email || "USER"}</span>
          </Link>
        </nav>
      </header>

      <main className="bd-main">
        <div className="bd-card">
          <div className="bd-meta">
            <div className="bd-author">👤 {post.authorName || "익명"}</div>
            <div className="bd-time">
              {fmt(post.createdAt)}
              {isEdited(post.createdAt, post.updatedAt) && (
                <span className="bd-edited"> (수정됨 {fmt(post.updatedAt)})</span>
              )}
            </div>
            <div className="bd-actions">
              {canModifyPost && (
                <>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => navigate(`/boards/${cat}/${id}/edit`)}
                  >
                    수정
                  </button>
                  <button className="link-btn" onClick={removePostHandler}>
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
          <h2 className="bd-title">{post.title}</h2>
          <p className="bd-content">{post.content}</p>
        </div>

        <section className="bd-comments">
          {(post.comments || []).map((c) => {
            const cCanDelete = isAdmin || isOwnerOf(c, auth);
            return (
              <div key={c.id} className="cmt-block">
                <div className="cmt-box">
                  <div className="cmt-header">
                    <div className="cmt-author">👤 {c.authorName || "익명"}</div>
                    <div className="cmt-time">{fmt(c.createdAt)}</div>
                    <div className="cmt-actions">
                      {cCanDelete && (
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => removeComment(c.id)}
                          disabled={deletingCmtId === c.id}
                          title="댓글 삭제"
                        >
                          {deletingCmtId === c.id ? "삭제중…" : "삭제"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="cmt-body">{c.content}</div>
                </div>
              </div>
            );
          })}
        </section>

        <form className="bd-write" onSubmit={addComment}>
          <textarea
            placeholder="댓글을 입력하세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="bd-submit">등록</button>
        </form>
      </main>
    </div>
  );
}
