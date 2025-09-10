import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/BoardDetailPage.css";

// slug ↔ label ↔ enum
const CATS = [
    { slug: "notice", label: "공지 게시판", enum: "NOTICE" },
    { slug: "free", label: "자유 게시판", enum: "FREE" },
    { slug: "matching", label: "매칭 게시판", enum: "MATCH" },
    { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판", enum: "FIND" },
];

// ---- 데모 더미 데이터 (서버 연동 전에만 사용) ----
const MOCK_POSTS = [
    {
        id: 1,
        category: "MATCH",
        author: "익명",
        createdAt: "09/09 13:00",
        title: "나랑 룸메할사람?",
        content: "나랑 룸메할 사람 있을까",
    },
];

const MOCK_COMMENTS = [
    {
        id: 101,
        author: "익명",
        createdAt: "09/09 13:00",
        content: "나랑 룸메할래?",
        replies: [
            { id: 201, author: "익명", createdAt: "09/09 13:30", content: "응!" },
        ],
    },
];

export default function BoardDetailPage() {
    const { cat, id } = useParams();
    const navigate = useNavigate();
    const [name] = useState("Admin");

    const currentCat = CATS.find((c) => c.slug === cat);
    const post = useMemo(() => {
        // 실제에선 id/cat으로 API 호출해 받아옵니다.
        const p = MOCK_POSTS.find((x) => String(x.id) === String(id));
        return p ?? {
            id,
            category: currentCat?.enum ?? "FREE",
            author: "익명",
            createdAt: "09/09 13:00",
            title: "제목",
            content: "내용",
        };
    }, [cat, id, currentCat]);

    const [comments, setComments] = useState(MOCK_COMMENTS);
    const [commentText, setCommentText] = useState("");

    const addComment = (e) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text) return;
        setComments((prev) => [
            ...prev,
            {
                id: Date.now(),
                author: "익명",
                createdAt: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
                content: text,
                replies: [],
            },
        ]);
        setCommentText("");
    };

    const addReply = (parentId, text) => {
        setComments((prev) =>
            prev.map((c) =>
                c.id === parentId
                    ? {
                        ...c,
                        replies: [
                            ...c.replies,
                            {
                                id: Date.now(),
                                author: "익명",
                                createdAt: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
                                content: text,
                            },
                        ],
                    }
                    : c
            )
        );
    };

    return (
        <div className="bd-wrap">
            {/* 상단바 */}
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

            {/* 본문 카드 */}
            <main className="bd-main">
                <div className="bd-card">
                    <div className="bd-meta">
                        <div className="bd-author">👤 {post.author}</div>
                        <div className="bd-time">{post.createdAt}</div>
                        <div className="bd-actions">
                            <button
                                type="button" 
                                className="link-btn"
                                onClick={() => navigate(`/boards/${cat}/${id}/edit`)}
                            >
                                수정
                            </button>
                            <button className="link-btn">삭제</button>
                        </div>
                    </div>

                    <h2 className="bd-title">{post.title}</h2>
                    <p className="bd-content">{post.content}</p>
                </div>

                {/* 댓글 리스트 */}
                <section className="bd-comments">
                    {comments.map((c) => (
                        <CommentItem key={c.id} data={c} onReply={(text) => addReply(c.id, text)} />
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
            </main>
        </div>
    );
}

function CommentItem({ data, onReply }) {
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");

    const submitReply = (e) => {
        e.preventDefault();
        const t = replyText.trim();
        if (!t) return;
        onReply(t);
        setReplyText("");
        setReplyOpen(false);
    };

    return (
        <div className="cmt-block">
            <div className="cmt-box">
                <div className="cmt-header">
                    <div className="cmt-author">👤 {data.author}</div>
                    <div className="cmt-time">{data.createdAt}</div>
                    <div className="cmt-actions">
                        <button className="link-btn">수정</button>
                        <button className="link-btn">삭제</button>
                    </div>
                </div>
                <div className="cmt-body">{data.content}</div>

                <div className="cmt-footer">
                    <button className="link-btn" onClick={() => setReplyOpen((v) => !v)}>
                        {replyOpen ? "답글 취소" : "답글"}
                    </button>
                </div>

                {replyOpen && (
                    <form className="reply-write" onSubmit={submitReply}>
                        <textarea
                            placeholder="답글을 입력하세요"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button type="submit" className="bd-submit sm">등록</button>
                    </form>
                )}
            </div>

            {/* 대댓글 */}
            {data.replies?.length > 0 && (
                <div className="replies">
                    {data.replies.map((r) => (
                        <div key={r.id} className="reply-box">
                            <div className="reply-prefix">↪</div>
                            <div className="reply-main">
                                <div className="reply-header">
                                    <div className="cmt-author">👤 {r.author}</div>
                                    <div className="cmt-time">{r.createdAt}</div>
                                    <div className="cmt-actions">
                                        <button className="link-btn">수정</button>
                                        <button className="link-btn">삭제</button>
                                    </div>
                                </div>
                                <div className="reply-body">{r.content}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
