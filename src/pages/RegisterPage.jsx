import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    smoking: 'NO', // 'YES' | 'NO'
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    if (!validateEmail(form.email)) return '올바른 이메일 형식을 입력하세요.';
    if (form.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (form.password !== form.confirmPassword) return '비밀번호가 일치하지 않습니다.';
    if (!form.gender) return '성별을 선택하세요.';
    if (!['YES','NO'].includes(form.smoking)) return '흡연 여부를 선택하세요.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    try {
      setLoading(true);
      // 👉 실제 백엔드 엔드포인트로 교체하세요.
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          gender: form.gender,         // 'MALE' | 'FEMALE' | 'OTHER' 등 백엔드 스키마에 맞추세요
          smoking: form.smoking === 'YES', // boolean으로 받는 경우 예시
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || '회원가입에 실패했습니다.');
      }

      setOk('회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.');
      setTimeout(() => navigate('/'), 900);
    } catch (e) {
      setErr(e.message || '문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" role="main" aria-labelledby="register-title">
        <header className="auth-header">
          <h1 id="register-title" className="brand">everymoment</h1>
          <p className="subtitle">회원가입</p>
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
            <input
              name="password"
              type="password"
              placeholder="8자 이상"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">비밀번호 확인</span>
            <input
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              value={form.confirmPassword}
              onChange={onChange}
              autoComplete="new-password"
              required
            />
          </label>

          <fieldset className="field">
            <legend className="field-label">성별</legend>
            <div className="radio-row">
              <label className="radio">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={form.gender === 'MALE'}
                  onChange={onChange}
                />
                <span>남성</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={form.gender === 'FEMALE'}
                  onChange={onChange}
                />
                <span>여성</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  checked={form.gender === 'OTHER'}
                  onChange={onChange}
                />
                <span>기타</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="field">
            <legend className="field-label">흡연 여부</legend>
            <div className="radio-row">
              <label className="radio">
                <input
                  type="radio"
                  name="smoking"
                  value="YES"
                  checked={form.smoking === 'YES'}
                  onChange={onChange}
                />
                <span>흡연</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="smoking"
                  value="NO"
                  checked={form.smoking === 'NO'}
                  onChange={onChange}
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

          <Link to="/" className="secondary linklike">로그인으로 돌아가기</Link>
        </form>
      </div>
    </div>
  );
}
