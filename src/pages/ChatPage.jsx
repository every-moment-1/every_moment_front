import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { chatStore } from '../store/chatStore';
import '../styles/Chat.css';

export default function ChatPage() {
  const { roomId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  // URL에 peerId가 온 경우(매칭 결과에서 처음 진입) 방 보장 후 리다이렉트
  useEffect(() => {
    const peerId = search.get('peerId');
    const peerName = search.get('peerName') || '익명';
    if (peerId) {
      const rid = chatStore.ensureRoom({ peerId, peerName });
      navigate(`/chat/${rid}`, { replace: true });
    }
  }, [search, navigate]);

  const [rooms, setRooms] = useState(chatStore.listRooms());
  const room = useMemo(() => (roomId ? chatStore.getRoom(roomId) : null), [roomId]);

  // 새 메시지 전송
  const [text, setText] = useState('');
  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !room) return;
    chatStore.sendMessage(room.id, t, 'me');
    setRooms(chatStore.listRooms());
    setText('');
  };

  return (
    <div className="chat-page">
      <header className="cp-topbar">
        <Link to="/match" className="cp-icon-btn" aria-label="뒤로가기">←</Link>
        <div className="cp-title">채팅</div>
        <nav className="cp-actions">
          <Link to="/profile" className="cp-icon-btn" aria-label="프로필">👤</Link>
          <button className="cp-icon-btn" aria-label="메뉴">☰</button>
        </nav>
      </header>

      <div className="cp-layout">
        {/* 좌측 목록 */}
        <aside className="cp-list">
          {rooms.length === 0 && (
            <div className="cp-empty">채팅방이 없습니다. 매칭 결과에서 “채팅하기”를 눌러 시작하세요.</div>
          )}
          {rooms.map(r => (
            <Link
              key={r.id}
              to={`/chat/${r.id}`}
              className={`cp-list-item ${roomId === r.id ? 'active' : ''}`}
            >
              <span className="cp-avatar" aria-hidden>👤</span>
              <div className="cp-li-main">
                <div className="cp-li-row">
                  <b>{r.peerName}</b>
                  <span className="cp-li-time">
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="cp-li-last">
                  {r.messages[r.messages.length - 1]?.text || ''}
                </div>
              </div>
            </Link>
          ))}
        </aside>

        {/* 우측 방 */}
        <section className="cp-room">
          {!room ? (
            <div className="cp-placeholder">채팅방을 선택하세요.</div>
          ) : (
            <>
              <header className="cp-room-head">
                <button className="cp-back-mini" onClick={() => navigate('/chat')} aria-label="목록으로">←</button>
                <div className="cp-peer">{room.peerName}</div>
              </header>

              <div className="cp-messages">
                {room.messages.map(m => (
                  <div key={m.id} className={`cp-row ${m.who === 'me' ? 'me' : 'them'}`}>
                    <div className="cp-bubble">
                      {m.text}
                      <span className="cp-time">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form className="cp-composer" onSubmit={send}>
                <input
                  className="cp-input"
                  placeholder="메시지 입력"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="cp-send" aria-label="전송">➤</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
