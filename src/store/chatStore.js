// 아주 단순한 in-memory + localStorage 기반 채팅 스토어
const LS_ROOMS = 'em_chat_rooms';
const LS_MSGS  = 'em_chat_msgs';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

const state = {
  rooms: load(LS_ROOMS, []),           // [{id, peerId, peerName, lastMsg, lastAt}]
  msgs:  load(LS_MSGS,  {}),           // { [roomId]: [{id, from:'me'|'peer', text, time}] }
};
let listeners = [];
const notify = () => listeners.forEach(fn => fn());

export const chatStore = {
  // 방 목록/메시지 조회
  getRooms() { return state.rooms; },
  getMessages(roomId) { return state.msgs[roomId] || []; },

  // 매칭 결과에서 호출: 상대(peer)와의 방을 보장 후 roomId 리턴
  ensureRoom({ peerId, peerName = '익명' }) {
    let room = state.rooms.find(r => r.peerId === String(peerId));
    if (!room) {
      const id = `r_${peerId}`;
      room = { id, peerId: String(peerId), peerName, lastMsg: '', lastAt: '' };
      state.rooms = [room, ...state.rooms];
      state.msgs[id] = [];
      save(LS_ROOMS, state.rooms); save(LS_MSGS, state.msgs); notify();
    }
    return room.id;
  },

  // 메시지 전송
  sendMessage(roomId, text, from = 'me') {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const msg = { id: Date.now(), from, text, time: `${hh}:${mm}` };

    state.msgs[roomId] = [...(state.msgs[roomId] || []), msg];
    state.rooms = state.rooms.map(r =>
      r.id === roomId ? { ...r, lastMsg: text, lastAt: msg.time } : r
    );
    save(LS_MSGS, state.msgs); save(LS_ROOMS, state.rooms); notify();
    return msg;
  },

  // 구독 (UI 자동 갱신)
  subscribe(fn) { listeners.push(fn); return () => { listeners = listeners.filter(f => f !== fn); }; },
};
