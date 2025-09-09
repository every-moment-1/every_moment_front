import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateEmail = (email) => {
    // 간단 이메일 형식 검증 (username@domain)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!form.email || !form.password) {
      setErr('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (!validateEmail(form.email)) {
      setErr('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      // 👉 실제 API 엔드포인트로 교체
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || '로그인에 실패했습니다.');
      }

      navigate('/home');
    } catch (e) {
      setErr(e.message || '로그인 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" role="main" aria-labelledby="login-title">
        <header className="auth-header">
          <h1 id="login-title" className="brand">everymoment</h1>
          <p className="subtitle">기숙사 매칭 시스템</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span className="field-label">이메일</span>
            <input
              name="email"
              type="email"
              placeholder="example@domain.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">비밀번호</span>
            <div className="pw-field">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? '숨김' : '보기'}
              </button>
            </div>
          </label>

          {err && <div className="error" role="alert">{err}</div>}

          <button type="submit" className="primary" disabled={loading}>
            {loading ? '로그인 중…' : '로그인'}
          </button>

          <Link to="/register" className="secondary linklike" aria-label="회원가입으로 이동">
            회원가입
          </Link>
        </form>
      </div>
    </div>
  );
}