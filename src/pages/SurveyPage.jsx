import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // 문항 정의 (시안 텍스트/옵션)
  const QUESTIONS = useMemo(() => ([
    {
      key: 'sleepTime',
      title: '1. 평소 몇시에 주무시나요?',
      options: ['10시 이후', '1시 이후', '3시 이후'],
      cols: 3,
    },
    {
      key: 'cleanFreq',
      title: '2. 주기적으로 얼마나 청소하시나요?(일주일 기준)',
      options: ['5-6회', '3-4회', '1-2회', '하지않음'],
      cols: 3, // 3열 그리드로도 충분 / 마지막 줄은 자동 줄바꿈
    },
    {
      key: 'noiseSensitive',
      title: '3. 소음에 얼마나 민감하신가요?',
      options: ['예민함', '보통', '민감하지 않음'],
      cols: 3,
    },
    {
      key: 'preferredFloor',
      title: '4. 원하시는 층은 어떻게 되시나요?',
      options: ['저층', '중간층', '고층'],
      cols: 3,
    },
    {
      key: 'preferredTemp',
      title: '5. 선호하시는 방 온도는 어떻게 되시나요?(여름/겨울 기준)',
      options: ['20도 미만/22도 미만', '20~24도/22~26도', '24도 초과/26도 초과'],
      cols: 3,
    },
  ]), []);

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const allAnswered = QUESTIONS.every(q => !!answers[q.key]);

  const onChange = (qKey, value) => {
    setAnswers(a => ({ ...a, [qKey]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!allAnswered) {
      setErr('모든 문항에 응답해주세요.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/survey', {
        userId: user?.id,
        gender,                 // 상단 필터 포함
        age: age ? Number(age) : undefined,
        ...answers,
      });
      setOk('설문이 제출되었습니다.');
      setTimeout(() => navigate('/main', { replace: true }), 700);
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2.message || '제출 중 오류가 발생했습니다.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-wrap">
      {/* 상단 바 */}
      <div className="topbar dark">
        <button
          className="icon-btn ghost"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
        >←</button>
        <div className="title">설문 조사</div>
        <div className="top-actions">
          <button className="icon-btn ghost" aria-label="검색">🔍</button>
          <button className="icon-btn ghost" aria-label="프로필">👤</button>
          <button className="icon-btn ghost" aria-label="메뉴">≡</button>
        </div>
      </div>

      {/* 본문 */}
      <form className="survey-body" onSubmit={handleSubmit}>
        {/* 상단 필터: 성별 세그먼트 + 나이 pill 입력 */}
        <div className="filters">
          <div className="seg-group" role="tablist" aria-label="성별">
            <button
              type="button"
              role="tab"
              aria-selected={gender === 'MALE'}
              className={`seg ${gender === 'MALE' ? 'active' : ''}`}
              onClick={() => setGender('MALE')}
            >
              남성
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={gender === 'FEMALE'}
              className={`seg ${gender === 'FEMALE' ? 'active' : ''}`}
              onClick={() => setGender('FEMALE')}
            >
              여성
            </button>
          </div>

          <div className="pill-input">
            <label htmlFor="age" className="pill-label">나이</label>
            <input
              id="age"
              type="number"
              min={1}
              max={120}
              inputMode="numeric"
              placeholder="나이를 입력해주세요"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>

        {/* 문항 카드들 */}
        {QUESTIONS.map((q) => {
          const selected = !!answers[q.key];
          return (
            <fieldset
              key={q.key}
              className={`field fieldset question-card ${selected ? 'selected' : ''}`}
            >
              <legend className="field-label">{q.title}</legend>
              <div className={`radio-grid ${q.cols === 3 ? 'three' : 'two'}`}>
                {q.options.map((opt) => (
                  <label className="radio" key={opt}>
                    <input
                      type="radio"
                      name={q.key}
                      value={opt}
                      checked={answers[q.key] === opt}
                      onChange={(e) => onChange(q.key, e.target.value)}
                      required
                    />
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
