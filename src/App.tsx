import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './app/store';
import { antdTheme } from './theme/antd-theme';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import Roadmap from './pages/Roadmap';
import LandingPage from './pages/LandingPage';
import React from 'react';
import ProtectedLayout from './components/ProtectedLayout';
import PublicLayout from './components/PublicLayout';

// Market Analysis
import MarketAnalysis from './pages/MarketAnalysis/MarketAnalysis';

// Theory pages
import TheoryCoursesPage from './pages/Theory/TheoryCoursesPage';
import CreateTheoryCoursePage from './pages/Theory/CreateTheoryCoursePage';
import TheoryCourseTreePage from './pages/Theory/TheoryCourseTreePage';
import TheoryLessonPage from './pages/Theory/TheoryLessonPage';

// Quiz pages
import QuizPage from './pages/Quizzes/QuizPage';
import QuizzesListPage from './pages/Quizzes/QuizzesListPage';
import CreateQuizPage from './pages/Quizzes/CreateQuizPage';

// Anki pages
import AnkiDecksListPage from './pages/Anki/AnkiDecksListPage';
import AnkiPracticePage from './pages/Anki/AnkiPracticePage';
import CreateAnkiDeckPage from './pages/Anki/CreateAnkiDeckPage';
import GigaChatAssistantPage from './pages/GigaChatAssistantPage';
import HelpCenterPage from './pages/HelpCenterPage';

import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  return (
    <ConfigProvider
      theme={antdTheme}
      wave={{ disabled: true }}
    >
      <BrowserRouter basename='/aitutor'>
          <Routes>

            {/* Public routes (no navbar) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            {/* Protected Routes (with navbar) */}
            <Route element={<ProtectedLayout />}>
    
              <Route path="/profile" element={<ProfilePage />} />

              {/* Market Analysis  */}
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              
              {/* Theory Courses Routes */}
              <Route path="/theory" element={<TheoryCoursesPage />} />
              <Route path="/theory/create" element={<CreateTheoryCoursePage />} />
              <Route path="/theory/courses/:courseId" element={<TheoryCourseTreePage />} />
              <Route path="/theory/lessons/:lessonId" element={<TheoryLessonPage />} />

              {/* Quiz Routes */}
              <Route path="/quizzes" element={<QuizzesListPage />} />
              <Route path="/quizzes/create" element={<CreateQuizPage />} />
              <Route path="/quizzes/:quizId" element={<QuizPage />} />

              {/* Anki Routes */}
              <Route path="/anki" element={<AnkiDecksListPage />} />
              <Route path="/anki/create" element={<CreateAnkiDeckPage />} />
              <Route path="/anki/decks/:deckId/practice" element={<AnkiPracticePage />} />

              {/* Help Center */}
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/help/chat" element={<GigaChatAssistantPage />} />
            </Route>

            {/* Not found route - must be last! */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
        <AppContent />
    </Provider>
  );
}

export default App;
