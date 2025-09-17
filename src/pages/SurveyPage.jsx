// src/pages/SurveyPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { authStore } from '../store/auth';
import '../styles/SurveyPage.css';

export default function SurveyPage() {
  const navigate = useNavigate();

  // 1) 스토어 사용자 + localStorage 보강
  const userFromStore = authStore.getUser?.();
  const userFromLS = (() => {
    try { return JSON.parse(localStorage.getItem('em_user') || 'null'); }
    catch { return null; }
  })();
  const [profile, setProfile] = useState(userFromStore || userFromLS || null);

  // 2) 제출 여부/점검 상태
  const [checking, setChecking] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ▼ 메뉴 드롭다운 상태 & 외부 클릭 닫기
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);


  // 3) 성별 라벨 (모든 형태 대응)
  const genderText = (g) => {
    if (g === null || g === undefined) return '미설정';
    if (typeof g === 'number') return g === 0 ? '남성' : g === 1 ? '여성' : '미설정';
    const v = String(g).trim().toLowerCase();
    if (['0', 'm', 'male', '남', '남성', '남자'].includes(v)) return '남성';
    if (['1', 'f', 'female', '여', '여성', '여자'].includes(v)) return '여성';
    return '미설정';
  };

  // 4) 프로필 없으면 서버 조회(선택)
  useEffect(() => {
    if (profile?.id) return;
    (async () => {
      try {
        // 필요 시 /api/users/me 호출 가능
      } catch {/* 무시 */ }
    })();
  }, [profile?.id]);

  // 다양한 키 후보에서 성별/아이디 추출
  const userId =
    profile?.id || profile?.userId || profile?.memberId || profile?.uid;
  const genderCode =
    profile?.gender ?? profile?.sex ?? profile?.genderCode ?? null;

  const genderLabel = genderText(genderCode);
  const displayName =
    profile?.nickname || profile?.name || profile?.username || '사용자';

  // 5) 설문 질문 정의
  const QUESTIONS = useMemo(() => ([
    {
      key: 'sleepTime', title: '1. 평소 몇시에 주무시나요?', options: [
        { label: '10시 이후', value: 1 },
        { label: '1시 이후', value: 2 },
        { label: '3시 이후', value: 3 },
      ], cols: 3
    },
    {
      key: 'cleanliness', title: '2. 주기적으로 얼마나 청소하시나요?(일주일 기준)', options: [
        { label: '5-6회', value: 1 },
        { label: '3-4회', value: 2 },
        { label: '1-2회', value: 3 },
        { label: '하지않음', value: 4 },
      ], cols: 3
    },
    {
      key: 'noiseSensitivity', title: '3. 소음에 얼마나 민감하신가요?', options: [
        { label: '예민함', value: 1 },
        { label: '보통', value: 2 },
        { label: '민감하지 않음', value: 3 },
      ], cols: 3
    },
    {
      key: 'height', title: '4. 원하시는 층은 어떻게 되시나요?', options: [
        { label: '저층', value: 1 },
        { label: '중간층', value: 2 },
        { label: '고층', value: 3 },
      ], cols: 3
    },
    {
      key: 'roomTemp', title: '5. 선호하시는 방 온도는 어떻게 되시나요?(여름/겨울 기준)', options: [
        { label: '20도 미만/22도 미만', value: 1 },
        { label: '20도~24도/22도~26도', value: 2 },
        { label: '24도 초과/26도 초과', value: 3 },
      ], cols: 3
    },
  ]), []);

  const labelOf = (key, val) =>
    QUESTIONS.find(q => q.key === key)?.options.find(o => o.value === Number(val))?.label;

  // 6) 설문 제출 여부 확인
  useEffect(() => {
    if (!userId) { setChecking(false); return; }

    setChecking(true);
    (async () => {
      try {
        const res = await api.get(`/survey/${userId}`);
        const raw = res?.data;

        // 설문이 없으면 새 설문 작성 페이지로 유도
        if (!raw) {
          setIsSubmitted(false);
          return;  // 설문이 없으면 아무 것도 하지 않고 설문 페이지를 계속 보이게 함
        }

        // 설문 결과가 있을 경우
        setIsSubmitted(true);
        const resultForView = {
          name: displayName,
          sleepTime: labelOf('sleepTime', raw.sleepTime),
          cleanliness: labelOf('cleanliness', raw.cleanliness),
          noiseSensitivity: labelOf('noiseSensitivity', raw.noiseSensitivity),
          height: labelOf('height', raw.height),
          roomTemp: labelOf('roomTemp', raw.roomTemp),
        };

        // 결과 페이지로 리디렉션
        navigate('/survey/result', { replace: true, state: { result: resultForView } });
      } catch {
        setIsSubmitted(false);  // 오류가 발생하면 설문을 작성하도록 유도
      } finally {
        setChecking(false);
      }
    })();
  }, [userId]);

  // 7) 로컬 입력 상태
  const [age, setAge] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const allAnswered = QUESTIONS.every(q => answers[q.key]);
  const onChange = (k, v) => setAnswers(a => ({ ...a, [k]: Number(v) }));

  // 8) 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!userId) { setErr('로그인이 필요합니다.'); navigate('/login'); return; }
    if (isSubmitted) { setErr('이미 설문을 제출하셨습니다.'); return; }
    if (!age) { setErr('나이를 입력해주세요.'); return; }
    if (!allAnswered) { setErr('모든 문항에 응답해주세요.'); return; }

    const payload = {
      sleepTime: answers.sleepTime,
      cleanliness: answers.cleanliness,
      noiseSensitivity: answers.noiseSensitivity,
      height: answers.height,
      roomTemp: answers.roomTemp,
    };

    try {
      setLoading(true);
      await api.post(`/api/survey/submit/${userId}`, payload);
      setOk('설문이 제출되었습니다.');

      // [ADDED] 제출 후 자동으로 메인으로 이동
      try { setTimeout(() => navigate('/main', { replace: true }), 600); } catch { }

      const resultForView = {
        name: displayName,
        age: Number(age),
        sleepTime: labelOf('sleepTime', answers.sleepTime),
        cleanliness: labelOf('cleanliness', answers.cleanliness),
        noiseSensitivity: labelOf('noiseSensitivity', answers.noiseSensitivity),
        height: labelOf('height', answers.height),
        roomTemp: labelOf('roomTemp', answers.roomTemp),
      };
      setIsSubmitted(true);
      navigate('/survey/result', { replace: true, state: { result: resultForView } });
    } catch (e2) {
      const status = e2?.response?.status;
      const msg = e2?.response?.data?.message || e2?.message || '제출 중 오류가 발생했습니다.';
      setErr(status === 401 ? '세션이 만료되었습니다. 다시 로그인 후 시도해주세요.' : msg);
    } finally {
      setLoading(false);
    }
  };

  // ▼ 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("em_tokens") || "{}");
      const accessToken = tokens?.accessToken;
      const refreshToken = tokens?.refreshToken;

      const base = import.meta.env.VITE_API_BASE ?? "/api";
      if (refreshToken) {
        await api
          .post(
            `${base}/logout`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
            }
          )
          .catch(() => { }); // 서버 실패해도 아래 클린업 진행
      }

      localStorage.removeItem("em_tokens");
      localStorage.removeItem("em_user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userid");
      localStorage.removeItem("memberId");

      try {
        const { authStore } = await import("../store/auth");
        authStore?.logout?.();
      } catch { }

      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  };

  if (checking) {
    return (
      <div className="survey-wrap">
        <div className="topbar">
          <button className="icon-btn ghost" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="topbar-title">설문 조사</div>

          <nav className="top-icons">

            <Link to="/chat" aria-label="메시지" className="mp-icon-btn">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </Link>

            <Link to="/profile" className="mp-profile-chip" aria-label="프로필">
              <span className="mp-avatar" aria-hidden>
                👤
              </span>
            </Link>

            {/* ▼ 메뉴 버튼 + 드롭다운 */}
            <div className="mp-menu" ref={menuRef}>
              <button
                className="mp-icon-btn mp-menu-btn"
                aria-label="메뉴"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {menuOpen && (
                <ul className="mp-menu-dd" role="menu">
                  <li role="menuitem">
                    <button className="mp-menu-item" onClick={handleLogout}>
                      로그아웃
                    </button>
                  </li>
                </ul>
              )}
            </div>

          </nav>
        </div>
        <div className="survey-body"><div className="success">설문 상태 확인 중…</div></div>
      </div>
    );
  }

  const disabled = isSubmitted;

  return (
    <div className="survey-wrap">
      <div className="topbar">
        <button
          className="back-btn"
          aria-label="뒤로가기"
          onClick={() => {
            navigate("/main");
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="title">설문 조사</div>
        <nav className="top-icons">

          <Link to="/chat" aria-label="메시지" className="mp-icon-btn">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Link>

          <Link to="/profile" className="mp-profile-chip" aria-label="프로필">
            <span className="mp-avatar" aria-hidden>
              👤
            </span>
          </Link>

          {/* ▼ 메뉴 버튼 + 드롭다운 */}
          <div className="mp-menu" ref={menuRef}>
            <button
              className="mp-icon-btn mp-menu-btn"
              aria-label="메뉴"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {menuOpen && (
              <ul className="mp-menu-dd" role="menu">
                <li role="menuitem">
                  <button className="mp-menu-item" onClick={handleLogout}>
                    로그아웃
                  </button>
                </li>
              </ul>
            )}
          </div>

        </nav>
      </div>

      <form className="survey-body" onSubmit={handleSubmit}>
        {disabled && (
          <div className="success" role="status" style={{ marginBottom: 10 }}>
            이미 설문을 제출하셨습니다.&nbsp;
            <button
              type="button"
              className="primary"
              style={{ width: 'auto', height: 34, padding: '0 12px', marginLeft: 8 }}
              onClick={() => navigate('/survey/result', { replace: true })}
            >
              결과 보기
            </button>
          </div>
        )}

        {/* 성별/나이 */}
        <div className="row meta">
          <div className="meta-field">
            <label className="meta-label">성별</label>
            <div className="gender-chip" aria-readonly="true">{genderLabel}</div>
          </div>
          <div className="meta-field">
            <label htmlFor="age" className="meta-label">나이</label>
            <input
              id="age"
              className="age-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              placeholder="나이를 입력해주세요"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
              required
              disabled={disabled}
            />
          </div>
        </div>

        {/* 질문 카드 */}
        {QUESTIONS.map((q) => {
          const selected = !!answers[q.key];
          return (
            <fieldset key={q.key} className={`field question-card ${selected ? 'selected' : ''}`} disabled={disabled}>
              <legend className="field-label">{q.title}</legend>
              <div className={`radio-grid ${q.cols === 3 ? 'three' : 'two'}`}>
                {q.options.map((opt) => (
                  <label className="radio" key={opt.value}>
                    <input
                      type="radio"
                      name={q.key}
                      value={opt.value}
                      checked={answers[q.key] === opt.value}
                      onChange={(e) => onChange(q.key, e.target.value)}
                      required
                      disabled={disabled}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        {err && <div className="error" role="alert">{err}</div>}
        {ok && <div className="success" role="status">{ok}</div>}

        <div className="submit-bar">
          <button type="submit" className="primary" disabled={!allAnswered || loading || disabled}>
            {disabled ? '이미 제출됨' : (loading ? '제출 중…' : '제출')}
          </button>
        </div>
      </form>
    </div>
  );
}
