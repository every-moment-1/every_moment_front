// src/pages/SurveyPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { authStore } from '../store/auth';
import '../styles/SurveyPage.css';

export default function SurveyPage() {
  const navigate = useNavigate();
  const user = authStore.getUser();

  // 상단 필터(성별/나이)
  const [gender, setGender] = useState(
    user?.gender === 'FEMALE' ? 'FEMALE' : user?.gender === 'MALE' ? 'MALE' : 'MALE'
  );
  const [age, setAge] = useState('');

  // 문항 정의
  const QUESTIONS = useMemo(() => ([
    { key: 'sleepTime',       title: '1. 평소 몇시에 주무시나요?',                        options: ['10시 이후','1시 이후','3시 이후'], cols: 3 },
    { key: 'cleanFreq',       title: '2. 주기적으로 얼마나 청소하시나요?(일주일 기준)',      options: ['5-6회','3-4회','1-2회','하지않음'], cols: 3 },
    { key: 'noiseSensitive',  title: '3. 소음에 얼마나 민감하신가요?',                     options: ['예민함','보통','민감하지 않음'], cols: 3 },
    { key: 'preferredFloor',  title: '4. 원하시는 층은 어떻게 되시나요?',                  options: ['저층','중간층','고층'], cols: 3 },
    { key: 'preferredTemp',   title: '5. 선호하시는 방 온도는 어떻게 되시나요?(여름/겨울 기준)', options: ['20도 미만/22도 미만','20~24도/22~26도','24도 초과/26도 초과'], cols: 3 },
  ]), []);

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const allAnswered = QUESTIONS.every(q => !!answers[q.key]);
  const onChange = (qKey, value) => setAnswers(a => ({ ...a, [qKey]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!allAnswered) { setErr('모든 문항에 응답해주세요.'); return; }

    try {
      setLoading(true);
      const resp = await api.post('/survey', {
        userId: user?.id,
        gender,
        age: age ? Number(age) : undefined,
        ...answers,
      });

      // ✅ 응답에서 결과 ID를 뽑아 결과 페이지로 이동
      const payload  = resp?.data?.data ?? resp?.data ?? {};
      const resultId = payload.id ?? payload.resultId ?? payload.surveyId;
      setOk('설문이 제출되었습니다.');

      // id 있으면 /survey/result/:id, 없으면 /survey/result
      navigate(resultId ? `/survey/result/${resultId}` : '/survey/result', { replace: true });
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2.message || '제출 중 오류가 발생했습니다.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-wrap">
      {/* 상단 바 (메시지/프로필 이동 포함) */}
      <div className="topbar">
        <button className="icon-btn ghost" aria-label="뒤로 가기" onClick={() => navigate(-1)}>←</button>
        <div className="title">설문 조사</div>
        <div className="top-actions">
          <Link to="/chat" className="icon-btn ghost" aria-label="채팅">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                    fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </Link>
          <Link to="/profile" className="icon-btn ghost" aria-label="프로필">
            <span aria-hidden>👤</span>
          </Link>
          <button className="icon-btn ghost" aria-label="메뉴">≡</button>
        </div>
      </div>

      {/* 본문 */}
      <form className="survey-body" onSubmit={handleSubmit}>
        {/* 상단 필터 */}
        <div className="filters">
          <div className="seg-group" role="tablist" aria-label="성별">
            <button type="button" role="tab" aria-selected={gender==='MALE'}
                    className={`seg ${gender==='MALE'?'active':''}`} onClick={() => setGender('MALE')}>
              남성
            </button>
            <button type="button" role="tab" aria-selected={gender==='FEMALE'}
                    className={`seg ${gender==='FEMALE'?'active':''}`} onClick={() => setGender('FEMALE')}>
              여성
            </button>
          </div>

          <div className="pill-input">
            <label htmlFor="age" className="pill-label">나이</label>
            <input id="age" type="number" min={1} max={120} inputMode="numeric"
                   placeholder="나이를 입력해주세요" value={age}
                   onChange={(e) => setAge(e.target.value)} />
          </div>
        </div>

        {/* 문항 카드들 */}
        {QUESTIONS.map((q) => {
          const selected = !!answers[q.key];
          return (
            <fieldset key={q.key} className={`field fieldset question-card ${selected ? 'selected' : ''}`}>
              <legend className="field-label">{q.title}</legend>
              <div className={`radio-grid ${q.cols === 3 ? 'three' : 'two'}`}>
                {q.options.map((opt) => (
                  <label className="radio" key={opt}>
                    <input type="radio" name={q.key} value={opt}
                           checked={answers[q.key] === opt}
                           onChange={(e) => onChange(q.key, e.target.value)} required />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        {err && <div className="error" role="alert">{err}</div>}
        {ok && <div className="success" role="status">{ok}</div>}

        {/* 하단 제출 바 */}
        <div className="submit-bar">
          <button type="submit" className="primary" disabled={!allAnswered || loading}>
            {loading ? '제출 중…' : '제출'}
          </button>
        </div>
      </form>
    </div>
  );
}
