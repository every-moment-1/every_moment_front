import React from "react";   
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
<<<<<<< HEAD
import RegisterPage from './pages/RegisterPage'

=======
// import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
// import MatchPage from './pages/MatchPage'
// import BoardPage from './pages/BoardPage'
// import BoardDetailPage from './pages/BoardDetailPage'
// import AdminPage from './pages/AdminPage'
import MainPage from './pages/MainPage'   // ✅ 추가
>>>>>>> 8381ed1 (MainPage, ProfilePage add)

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
<<<<<<< HEAD
=======
      <Route path="/profile" element={<ProfilePage />} />
      {/* <Route path="/home" element={<HomePage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/board/:id" element={<BoardDetailPage />} />
      <Route path="/admin" element={<AdminPage />} /> */}
      <Route path="/main" element={<MainPage />} />  {/* ✅ MainPage 경로 */}
>>>>>>> 8381ed1 (MainPage, ProfilePage add)
    </Routes>
  )
}

export default App
