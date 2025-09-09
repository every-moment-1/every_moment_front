import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
    // 예시 상태 (실서비스에선 axios로 불러와 세팅)
    const [name, setName] = useState("Admin");
    const [email] = useState("Admin@example.com"); // 읽기 전용
    const [gender] = useState("남성");              // 읽기 전용
    const [smoking] = useState("아니요");           // 읽기 전용

    const onSubmit = (e) => {
        e.preventDefault();
        alert(`프로필이 수정되었습니다.\n이름: ${name}`);
    };

    return (
        <div className="profile-wrap">
            <header className="profile-topbar">
                <Link to="/main" className="back-btn" aria-label="뒤로가기">
                    <svg viewBox="0 0 24 24" width="22" height="22">
                        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <h1 className="topbar-title">마이페이지</h1>
                <nav className="top-icons">
                    <Link to="/messages" className="icon-btn" aria-label="메시지">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" fill="currentColor" />
                        </svg>
                    </Link>
                    <Link to="/profile" className="icon-btn" aria-label="프로필">
                        <span aria-hidden>👤</span>
                    </Link>
                    <button className="icon-btn" aria-label="메뉴">
                        <svg viewBox="0 0 24 24" width="22" height="22">
                            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </nav>
            </header>

            <main className="profile-card">
                <div className="avatar-wrap">
                    <div className="avatar-circle" aria-hidden>👤</div>
                    <Link to="/survey/result" className="pill-btn">설문조사 결과</Link>
                </div>

                <form className="profile-form" onSubmit={onSubmit}>
                    <div className="grid-2">
                        <label className="field">
                            <span className="label-text">이름</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                placeholder="이름"
                            />
                        </label>

                        <label className="field">
                            <span className="label-text">성별</span>
                            <input
                                type="text"
                                value={gender}
                                disabled
                                className="input input-disabled"
                            />
                        </label>

                        <label className="field">
                            <span className="label-text">이메일</span>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="input input-disabled"
                            />
                        </label>

                        <label className="field">
                            <span className="label-text">흡연여부</span>
                            <input
                                type="text"
                                value={smoking}
                                disabled
                                className="input input-disabled"
                            />
                        </label>
                    </div>

                    <button type="submit" className="primary-btn">수정</button>
                </form>
            </main>
        </div>
    );
}
