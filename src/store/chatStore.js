const LS_KEY = 'dm_chat_rooms_v1';

function nowISO() { return new Date().toISOString(); }
function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
}
function save(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

export const chatStore = {
  /** 모든 방 목록 (updatedAt desc) */
  listRooms() {
    const db = load();
    const rooms = Object.values(db);
    rooms.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return rooms;
  },

  /** peerId로 만든 1:1 방을 보장하고 roomId를 리턴 */
  ensureRoom({ peerId, peerName = '익명' }) {
    const db = load();
    const existing = Object.values(db).find(r => r.peerId === peerId);
    if (existing) return existing.id;

    const id = `room_${peerId}`;
    db[id] = {
      id,
      peerId,
      peerName,
      messages: [
        { id: Date.now(), who: 'them', text: '안녕하세요!', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }
      ],
      updatedAt: nowISO()
    };
    save(db);
    return id;
  },

  getRoom(roomId) {
    const db = load();
    return db[roomId] || null;
  },

  sendMessage(roomId, text, who = 'me') {
    const db = load();
    const room = db[roomId];
    if (!room) return;
    room.messages.push({
      id: Date.now(),
      who,
      text,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    });
    room.updatedAt = nowISO();
    save(db);
    return room;
  }
};
