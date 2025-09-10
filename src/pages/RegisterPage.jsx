// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { authStore } from '../store/auth';
import '../styles/global.css'; // auth 전용 스타일(.auth-scope) 로드

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',       // 'MALE' | 'FEMALE'
    smoking: 'NO',    // 'YES' | 'NO'
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validate = () => {
    if (!validateEmail(form.email)) return '올바른 이메일 형식을 입력하세요.';
    if (form.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (form.password !== form.confirmPassword) return '비밀번호가 일치하지 않습니다.';
    if (!form.gender) return '성별을 선택하세요.';
    if (!['YES', 'NO'].includes(form.smoking)) return '흡연 여부를 선택하세요.';
    return '';
  };

  // 백엔드 필드 매핑 도우미
  const toUsername = (email) => {
    let base = (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '_');
    if (base.length < 3) base = base.padEnd(3, '_');
    if (base.length > 20) base = base.slice(0, 20);
    return base;
  };
  const toGenderInt = (g) => (g === 'MALE' ? 0 : 1); // 백엔드: 남=0, 여=1
  const toSmokingBool = (s) => (s === 'YES');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');

    const v = validate();
    if (v) { setErr(v); return; }

    try {
      setLoading(true);

      // 1) 회원가입
      await api.post('/auth/register', {
        username: toUsername(form.email),
        gender: toGenderInt(form.gender),
        email: form.email,
        password: form.password,
        smoking: toSmokingBool(form.smoking),
      });

      // 2) 자동 로그인
      const loginRes = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      const { accessToken, refreshToken, user } = loginRes.data?.data || loginRes.data || {};
      if (accessToken) authStore.setTokens({ accessToken, refreshToken });
      if (user) authStore.setUser(user);

      setOk('회원가입이 완료되었습니다.');
      navigate('/main', { replace: true });
    } catch (e) {
      const status = e?.response?.status;
      const serverMsg = e?.response?.data?.message;
      if (status === 409) {
        setErr(serverMsg || '이미 가입된 이메일입니다. 다른 이메일을 사용해 주세요.');
      } else {
        setErr(serverMsg || e?.message || '회원가입에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-scope">{/* ✅ global.css의 .auth-scope 범위 안에서만 스타일 적용 */}
      <div className="auth-card" role="main" aria-labelledby="register-title">
        <header className="auth-header">
          <h1 id="register-title" className="brand">every-moment</h1>
          <p className="subtitle">회원가입</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* 성별 */}
          <fieldset className="field fieldset">
            <legend className="field-label">성별</legend>
            <div className="radio-grid two">
              <label className="radio">
                <input
                  type="radio" name="gender" value="MALE"
                  checked={form.gender === 'MALE'}
                  onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                  required
                />
                <span>남성</span>
              </label>
              <label className="radio">
                <input
                  type="radio" name="gender" value="FEMALE"
                  checked={form.gender === 'FEMALE'}
                  onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                  required
                />
                <span>여성</span>
              </label>
            </div>
          </fieldset>

          {/* 이메일 */}
          <label className="field">
            <span className="field-label">아이디</span>
            <input
              name="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
          </label>

          {/* 비밀번호 */}
          <label className="field">
            <span className="field-label">비밀번호</span>
            <input
              name="password"
              type="password"
              placeholder="8자 이상"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </label>

          {/* 비밀번호 확인 */}
          <label className="field">
            <span className="field-label">비밀번호 확인</span>
            <input
              name="confirmPassword"
              type="password"
              placeholder="다시 입력"
              value={form.confirmPassword}
              onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </label>

          {/* 흡연 여부 */}
          <fieldset className="field fieldset">
            <legend className="field-label">흡연 여부</legend>
            <div className="radio-grid two">
              <label className="radio">
                <input
                  type="radio" name="smoking" value="YES"
                  checked={form.smoking === 'YES'}
                  onChange={(e) => setForm(f => ({ ...f, smoking: e.target.value }))}
                  required
                />
                <span>흡연</span>
              </label>
              <label className="radio">
                <input
                  type="radio" name="smoking" value="NO"
                  checked={form.smoking === 'NO'}
                  onChange={(e) => setForm(f => ({ ...f, smoking: e.target.value }))}
                  required
                />
                <span>비흡연</span>
              </label>
            </div>
          </fieldset>

          {err && <div className="error" role="alert">{err}</div>}
          {ok && <div className="success" role="status">{ok}</div>}

          <button type="submit" className="primary" disabled={loading}>
            {loading ? '처리 중…' : '회원가입'}
          </button>

          <Link to="/" className="linklike">로그인으로 돌아가기</Link>
        </form>
      </div>
    </div>
  );
}
