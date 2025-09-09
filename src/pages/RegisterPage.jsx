import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { authStore } from '../store/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    smoking: 'NO',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    const v = validate();
    if (v) { setErr(v); return; }

    try {
      setLoading(true);
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        gender: form.gender,
        smoking: form.smoking === 'YES',
      });

      // ✅ 선택 1) 자동 로그인
      const loginRes = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      const { accessToken, refreshToken, user } = loginRes.data || {};
      if (accessToken) authStore.setTokens({ accessToken, refreshToken });
      if (user) authStore.setUser(user);

      setOk('회원가입이 완료되었습니다.');
      navigate('/home', { replace: true });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || '회원가입에 실패했습니다.';
      setErr(msg);
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
              name="email" type="email" placeholder="example@domain.com"
              value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))}
              autoComplete="email" required
            />
          </label>

          <label className="field">
            <span className="field-label">비밀번호</span>
            <input
              name="password" type="password" placeholder="8자 이상"
              value={form.password} onChange={(e)=>setForm(f=>({...f, password:e.target.value}))}
              autoComplete="new-password" required
            />
          </label>

          <label className="field">
            <span className="field-label">비밀번호 확인</span>
            <input
              name="confirmPassword" type="password" placeholder="비밀번호 확인"
              value={form.confirmPassword} onChange={(e)=>setForm(f=>({...f, confirmPassword:e.target.value}))}
              autoComplete="new-password" required
            />
          </label>

          <fieldset className="field">
            <legend className="field-label">성별</legend>
            <div className="radio-row">
              {['MALE','FEMALE','OTHER'].map(g=>(
                <label key={g} className="radio">
                  <input type="radio" name="gender" value={g}
                    checked={form.gender===g}
                    onChange={(e)=>setForm(f=>({...f, gender:e.target.value}))}/>
                  <span>{g==='MALE'?'남성':g==='FEMALE'?'여성':'기타'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend className="field-label">흡연 여부</legend>
            <div className="radio-row">
              {['YES','NO'].map(s=>(
                <label key={s} className="radio">
                  <input type="radio" name="smoking" value={s}
                    checked={form.smoking===s}
                    onChange={(e)=>setForm(f=>({...f, smoking:e.target.value}))}/>
                  <span>{s==='YES'?'흡연':'비흡연'}</span>
                </label>
              ))}
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
