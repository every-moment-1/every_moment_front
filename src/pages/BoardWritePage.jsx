import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/BoardWritePage.css";

// slug ↔ 라벨 ↔ enum
const CATS = [
  { slug: "notice", label: "공지 게시판", enum: "NOTICE" },
  { slug: "free", label: "자유 게시판", enum: "FREE" },
  { slug: "matching", label: "매칭 게시판", enum: "MATCH" },
  { slug: "find-roommate", label: "매칭 없이 룸메 찾기 게시판", enum: "FIND" },
];

export default function BoardWritePage() {
  const { cat } = useParams();                       // notice | free | match | find
  const navigate = useNavigate();
  const current = CATS.find(c => c.slug === cat);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 잘못된 카테고리 접근 시 기본값 이동
  useEffect(() => {
    if (!current) navigate("/boards/notice/write", { replace: true });
  }, [current, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // TODO: 실제 API 연동 예시
    // await axios.post("/api/posts", {
    //   category: current.enum,
    //   title,
    //   content,
    // });

    alert("업로드 완료!");
    navigate(`/boards/${cat}`); // 업로드 후 해당 카테고리 목록으로 이동 (목록 라우트가 있다면)
  };

  if (!current) return null;

  return (
    <div className="bw-wrap">
      {/* 상단바 */}
      <header className="bw-topbar">
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

      <div className="write-form">
        {/* 제목(라벨) */}
        <div className="bw-category">{current.label} 글 작성</div>

        {/* 작성 폼 */}
        <form className="bw-card" onSubmit={submit}>
          <input
            className="bw-title"
            placeholder="제목을 작성해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="bw-content"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="bw-submit">업로드</button>
        </form>
      </div>

    </div>
  );
}
