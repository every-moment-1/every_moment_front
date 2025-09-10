import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";
import SurveyPage from "./pages/SurveyPage";
import MatchResultsPage from "./pages/MatchResultsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import BoardPage from "./pages/BoardPage"
import BoardWritePage from "./pages/BoardWritePage"
import BoardDetailPage from "./pages/BoardDetailPage";
import BoardEditPage from "./pages/BoardEditPage";

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
        path="/boards/:cat"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards/:cat/write"
        element={
          <ProtectedRoute>
            <BoardWritePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards/:cat/:id"
        element={
          <ProtectedRoute>
            <BoardDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/boards/:cat/:id/edit"
        element={
          <ProtectedRoute>
            <BoardEditPage />
          </ProtectedRoute>
        }
      />
 

    </Routes>
  );
}