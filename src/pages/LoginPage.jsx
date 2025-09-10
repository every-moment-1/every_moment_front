import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axiosInstance';
import { authStore } from '../store/auth';
import '../styles/global.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/main';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState({ email: '', password: '' });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'email') {
      setFieldErr((fe) => ({ ...fe, email: validateEmail(value) ? '' : '올바른 이메일 주소를 입력하세요.' }));
    }
    if (name === 'password') {
      setFieldErr((fe) => ({ ...fe, password: value ? '' : '비밀번호를 입력하세요.' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    const emailOk = validateEmail(form.email);
    const pwOk = !!form.password;
    setFieldErr({
      email: emailOk ? '' : '올바른 이메일 주소를 입력하세요.',
      password: pwOk ? '' : '비밀번호를 입력하세요.',
    });
    if (!emailOk || !pwOk) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      const { accessToken, refreshToken, user, message } = res.data || {};
      if (accessToken) authStore.setTokens({ accessToken, refreshToken });
      if (user) authStore.setUser(user);
      navigate(redirectTo, { replace: true });
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.message || '로그인에 실패했습니다.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap login">{/* 🔹 로그인 페이지 라벨 */}
      <div className="auth-card" role="main" aria-labelledby="login-title">
        <header className="auth-header">
          <h1 id="login-title" className="brand">everymoment</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              name="email" type="email"
              value={form.email} onChange={onChange} autoComplete="email" required
              aria-invalid={!!fieldErr.email} aria-describedby="email-error"
            />
            {fieldErr.email && <small id="email-error" className="hint error-text">{fieldErr.email}</small>}
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="pw-field">
              <input
                name="password" type={showPw ? 'text' : 'password'}
                value={form.password} onChange={onChange} autoComplete="current-password" required
                aria-invalid={!!fieldErr.password} aria-describedby="pw-error"
              />
              <button type="button" className="pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}>
                {showPw ? '숨김' : '보기'}
              </button>
            </div>
            {fieldErr.password && <small id="pw-error" className="hint error-text">{fieldErr.password}</small>}
          </label>

          {err && <div className="error" role="alert">{err}</div>}

          {/* 🔹 아웃라인 파란 버튼 */}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {/* 🔹 아래 텍스트 링크 형태 */}
          <Link to="/register" className="linklike" aria-label="회원가입으로 이동">회원 가입</Link>
        </form>
      </div>
    </div>
  );
}
