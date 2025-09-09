import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authStore } from '../store/auth';

export default function HomePage() {
  const navigate = useNavigate();
  const user = authStore.getUser();

  const handleLogout = () => {
    authStore.logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="page-wrap" style={{ padding: 24 }}>
      <header className="page-header" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>홈</h2>
        <div style={{ flex: 1 }} />
        <button onClick={handleLogout} className="linklike">로그아웃</button>
      </header>

      <section className="card" style={{ marginTop: 16 }}>
        <p><b>환영합니다</b>{user?.email ? `, ${user.email}` : ''}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Link to="/match" className="linklike">매칭 페이지</Link>
          <Link to="/board" className="linklike">게시판</Link>
          <Link to="/profile" className="linklike">프로필</Link>
        </div>
      </section>
    </div>
  );
}
