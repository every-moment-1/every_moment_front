import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import '../styles/MatchResults.css';
import { chatStore } from '../store/chatStore';

export default function MatchResultsPage() {
  const navigate = useNavigate();

  // ▼ 필터 & 목록 상태
  const [items, setItems] = useState([]);            // 누적 결과
  const [page, setPage] = useState(0);               // 0-base
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [filters, setFilters] = useState({
    gender: 'ALL',           // 'MALE' | 'FEMALE' | 'ALL'
    smoking: 'ALL',          // 'YES' | 'NO' | 'ALL'
    minScore: 0,             // 0~100
    q: ''                    // 닉네임 등 검색
  });

  const canLoadMore = hasNext && !loading;

  const fetchPage = async (nextPage = 0, append = false) => {
    setErr('');
    setLoading(true);
    try {
      const res = await api.get('/match/results', {
        params: {
          page: nextPage,
          size: 10,
          gender: filters.gender !== 'ALL' ? filters.gender : undefined,
          smoking: filters.smoking !== 'ALL' ? (filters.smoking === 'YES') : undefined,
          minScore: filters.minScore || undefined,
          q: filters.q || undefined,
        },
      });

      // 기대 응답: { items: [{id,name,age,gender,smoking,similarity,tags?:string[]}], page, hasNext }
      const { items: list = [], hasNext: hn = false } = res.data || {};
      setItems((prev) => (append ? [...prev, ...list] : list));
      setHasNext(hn);
      setPage(nextPage);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || '매칭 결과를 불러오지 못했습니다.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // 최초 & 필터 변경 시 1페이지 로드
  useEffect(() => {
    fetchPage(0, /*append=*/false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.gender, filters.smoking, filters.minScore]);

  const onSearch = (e) => {
    e.preventDefault();
    fetchPage(0, false);
  };

  const scoreLabel = (s) => `${Math.round(s)}%`;

  // 데모용: 빈 응답일 때 안내문
  const empty = useMemo(() => !loading && items.length === 0, [loading, items.length]);

  // ✅ 매칭 대상과의 채팅방 보장 후 이동
  const openChat = (cand) => {
    const roomId = chatStore.ensureRoom({
      peerId: cand.id,
      peerName: cand.name || '익명',
    });
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="match-page">
      {/* 상단바 */}
      <header className="mp-topbar">
        <Link to="/main" className="mp-icon-btn" aria-label="뒤로가기">←</Link>
        <div className="mp-title">매칭 하기</div>
        <nav className="mp-actions">
          <button className="mp-icon-btn" aria-label="검색">🔍</button>
          <Link to="/profile" className="mp-icon-btn" aria-label="프로필">👤</Link>
          <button className="mp-icon-btn" aria-label="메뉴">☰</button>
        </nav>
      </header>

      {/* 필터 바 */}
      <section className="mp-filters">
        <form className="mp-filter-form" onSubmit={onSearch}>
          <div className="mp-filter-row">
            <label className="mp-filter">
              <span>성별</span>
              <select
                value={filters.gender}
                onChange={(e)=>setFilters(f=>({...f, gender:e.target.value}))}
              >
                <option value="ALL">전체</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </label>

            <label className="mp-filter">
              <span>흡연</span>
              <select
                value={filters.smoking}
                onChange={(e)=>setFilters(f=>({...f, smoking:e.target.value}))}
              >
                <option value="ALL">전체</option>
                <option value="YES">흡연</option>
                <option value="NO">비흡연</option>
              </select>
            </label>

            <label className="mp-filter">
              <span>최소 유사도</span>
              <input
                type="number"
                min={0}
                max={100}
                value={filters.minScore}
                onChange={(e)=>setFilters(f=>({...f, minScore: Number(e.target.value)}))}
              />
            </label>

            <label className="mp-filter grow">
              <span>검색</span>
              <input
                type="search"
                placeholder="닉네임/메모"
                value={filters.q}
                onChange={(e)=>setFilters(f=>({...f, q:e.target.value}))}
              />
            </label>

            <button className="mp-btn" type="submit">적용</button>
          </div>
        </form>
      </section>

      {/* 본문 */}
      <main className="mp-body">
        <h2 className="mp-lead"><b>Admin</b>님과 유사도가 비슷해요</h2>

        {err && <div className="mp-error">{err}</div>}

        {empty && (
          <div className="mp-empty">
            조건에 맞는 결과가 없습니다. 필터를 조정해 보세요.
          </div>
        )}

        <ul className="mp-list">
          {items.map((c) => (
            <li key={c.id} className="mp-card">
              <div className="mp-avatar" aria-hidden>👤</div>

              <div className="mp-card-main">
                <div className="mp-name-row">
                  <div className="mp-name">{c.name ?? '익명'}</div>
                  <div className="mp-score-badge">{scoreLabel(c.similarity ?? 0)}</div>
                </div>

                <div className="mp-meta">
                  {(c.age ? `${c.age}살, ` : '')}
                  {c.gender === 'MALE' ? '남성' : c.gender === 'FEMALE' ? '여성' : '성별 비공개'}
                  {typeof c.smoking === 'boolean' ? ` · ${c.smoking ? '흡연' : '비흡연'}` : ''}
                </div>

                <div className="mp-sub">{(c.tags && c.tags.join(', ')) || '설문조사 기반 유사도'}</div>

                {/* 프로그레스바 형태의 유사도 시각화 */}
                <div className="mp-progress">
                  <span style={{ width: `${Math.max(0, Math.min(100, Math.round(c.similarity || 0)))}%` }} />
                </div>
              </div>

              <div className="mp-card-actions">
                {/* ✅ 여기만 변경 */}
                <button className="mp-chat-btn" onClick={() => openChat(c)}>
                  채팅하기
                </button>
              </div>
            </li>
          ))}

          {/* 로딩 스켈레톤 */}
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <li key={`sk-${i}`} className="mp-card sk">
              <div className="sk-avatar" />
              <div className="sk-lines">
                <div className="sk-line w60" />
                <div className="sk-line w40" />
                <div className="sk-line w80" />
              </div>
              <div className="sk-btn" />
            </li>
          ))}
        </ul>

        {/* 더 보기 */}
        {canLoadMore && (
          <div className="mp-more">
            <button className="mp-btn" onClick={() => fetchPage(page + 1, /*append=*/true)}>
              더 보기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
