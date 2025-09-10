import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";
import SurveyPage from "./pages/SurveyPage";
import SurveyResultpage from "./pages/SurveyResultPage.jsx";
import MatchResultsPage from "./pages/MatchResultsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import './styles/SurveyResultpage.css';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey"
        element={
          <ProtectedRoute>
            <SurveyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/surveyResult"
        element = {
          <ProtectedRoute>
            <SurveyResultpage/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/match"
        element={
          <ProtectedRoute>
            <MatchResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:roomId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}