// src/pages/SurveyResultPage.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { authStore } from '../store/auth';
import '../styles/SurveyResultPage.css';

export default function SurveyResultPage() {
  const navigate = useNavigate();

  const NAME = authStore.getUser()?.nickname || authStore.getUser()?.username || 'Admin';
  const AGE  = 21; 

  // 질문 타이틀 (SurveyPage와 맞춤)
  const QUESTIONS = useMemo(() => ([
    { key: 'sleepTime',      title: '1. 평소 몇시에 주무시나요?' },
    { key: 'cleanFreq',      title: '2. 주기적으로 얼마나 청소하시나요?(일주일 기준)' },
    { key: 'noiseSensitive', title: '3. 소음에 얼마나 민감하신가요?' },
    { key: 'preferredFloor', title: '4. 원하시는 층은 어떻게 되시나요?' },
    { key: 'preferredTemp',  title: '5. 선호하시는 방 온도는 어떻게 되시나요?(여름/겨울 기준)' },
  ]), []);

  // 임시 답변 
  const FAKE_ANSWERS = {
    sleepTime: '10시 이후',
    cleanFreq: '3-4회',
    noiseSensitive: '보통',
    preferredFloor: '저층',
    preferredTemp: '20도 미만/22도 미만',
  };

  return (
    <div className="result-wrap">
      <div className="topbar">
        <button className="icon-btn ghost" onClick={() => navigate(-1)} aria-label="뒤로 가기">←</button>
        <div className="title">설문 조사 완료</div>
        <div className="top-actions">
          <button className="icon-btn ghost" aria-label="채팅">💬</button>
          <Link to="/profile" className="profile-chip" aria-label="프로필">👤</Link>
          <button className="icon-btn ghost" aria-label="메뉴">≡</button>
        </div>
      </div>


      <main className="result-body">
        <h2 className="result-heading">{NAME}님({AGE}살)의 설문 조사 결과입니다</h2>

        <section className="card">
          <ol className="qa-list">
            {QUESTIONS.map((q, i) => (
              <li key={q.key} className="qa-item">
                <div className="q">
                  <span className="q-no">{i + 1}.</span>
                  <span className="q-text">{q.title.replace(/^\d+\.\s*/, '')}</span>
                </div>
                <div className="a">
                  <span className="radio-dot" aria-hidden="true" />
                  <span className="a-text">{FAKE_ANSWERS[q.key]}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="actions">
          <button className="primary cta" onClick={() => navigate('/match')}>
            나와 맞는 사람 찾기
          </button>
        </div>
      </main>
    </div>
  );
}
