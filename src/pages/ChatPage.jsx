import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { chatStore } from "../store/chatStore";
import "../styles/Chat.css";

export default function ChatPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();

  // 스토어 동기화
  const [rooms, setRooms] = useState(chatStore.getRooms());
  const [activeId, setActiveId] = useState(roomId || null);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  // 스토어 변화 구독
  useEffect(() => {
    const unsub = chatStore.subscribe(() => setRooms(chatStore.getRooms()));
    return unsub;
  }, []);

  // URL로 들어온 peer로 최초 방 생성 지원 (안정성용)
  useEffect(() => {
    const peerId = searchParams.get("peerId");
    const peerName = searchParams.get("peerName") || "익명";
    if (peerId) {
      const id = chatStore.ensureRoom({ peerId, peerName });
      navigate(`/chat/${id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // room param 변경 반영
  useEffect(() => { setActiveId(roomId || null); }, [roomId]);

  const activeRoom = useMemo(
    () => rooms.find(r => r.id === activeId) || null,
    [rooms, activeId]
  );
  const messages = chatStore.getMessages(activeId);

  // 전송
  const onSend = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !activeId) return;
    chatStore.sendMessage(activeId, value, "me");
    setText("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const openRoom = (id) => navigate(`/chat/${id}`);

  return (
    <div className="ch-wrap">
      {/* 상단바 */}
      <header className="ch-topbar">
        <button className="ch-icon ghost" aria-label="뒤로가기" onClick={() => navigate(-1)}>←</button>
        <div className="ch-top-title">채팅</div>
        <nav className="ch-top-actions">
          {/* 현재 페이지 아이콘 */}
          <Link to="/chat" className="ch-icon ghost" aria-label="채팅">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                    fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </Link>
          {/* ✅ 프로필 → /profile */}
          <Link to="/profile" className="ch-icon ghost" aria-label="프로필">
            <span aria-hidden>👤</span>
          </Link>
          <button className="ch-icon ghost" aria-label="메뉴">≡</button>
        </nav>
      </header>

      {/* 본문 */}
      <div className="ch-body">
        {/* 좌측: 방 목록 */}
        <aside className="ch-sidebar" aria-label="채팅방 목록">
          <ul className="ch-room-list">
            {rooms.map(r => (
              <li
                key={r.id}
                className={`ch-room ${activeId === r.id ? "active" : ""}`}
                onClick={() => openRoom(r.id)}
              >
                <div className="ch-room-left">
                  <div className="ch-avatar" aria-hidden>👤</div>
                  <div className="ch-room-main">
                    <div className="ch-room-name">{r.peerName}</div>
                    <div className="ch-room-last">{r.lastMsg || " "}</div>
                  </div>
                </div>
                <div className="ch-room-time">{r.lastAt}</div>
              </li>
            ))}
          </ul>
        </aside>

        {/* 우측: 대화창 */}
        <main className="ch-panel" aria-label="대화창">
          {activeRoom ? (
            <>
              <div className="ch-panel-head">
                <button className="ch-back" onClick={() => navigate("/chat")} aria-label="목록으로">〈</button>
                <div className="ch-peer">
                  <button className="ch-peer-avatar" onClick={() => navigate("/profile")} aria-label="프로필로 이동">👤</button>
                  <div className="ch-peer-name">{activeRoom.peerName}</div>
                </div>
              </div>

              <div className="ch-msgs" ref={scrollRef}>
                {messages.map(m => (
                  <div key={m.id} className={`msg-row ${m.from === "me" ? "my" : "peer"}`}>
                    <div className="bubble"><span className="txt">{m.text}</span></div>
                    <time className="time">{m.time}</time>
                  </div>
                ))}
              </div>

              <form className="ch-inputbar" onSubmit={onSend}>
                <input
                  className="ch-input"
                  placeholder="메시지 입력"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="ch-send" aria-label="전송">
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path d="M3 11l18-8-8 18-2-7-8-3z" fill="currentColor" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="ch-empty">대화를 시작할 상대를 선택하세요.</div>
          )}
        </main>
      </div>
    </div>
  );
}
