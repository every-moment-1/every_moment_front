import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import MatchPage from './pages/MatchPage'
import BoardPage from './pages/BoardPage'
import BoardDetailPage from './pages/BoardDetailPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/board/:id" element={<BoardDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App
