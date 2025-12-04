import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './app/store';
import { designTheme } from './theme/antd-theme';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import Roadmap from './pages/Roadmap';
import React from 'react';
import Dashboard, { CoursePage } from './pages/Dashboard';
import ProtectedLayout from './components/ProtectedLayout';
import CoursesPage from './pages/CoursesPage';
import CourseRoadmapPage from './pages/CourseRoadmapPage';
import ChatTutorPage from './pages/ChatTutorPage';
import CodeEditorPage from './pages/CodeEditorPage';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={designTheme}>
        <BrowserRouter basename='/aitutor'>
          <Routes>

            {/* Public Routes (no navbar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected Routes (with navbar) */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="/courses/:language" element={<CoursePage />} /> */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/roadmap" element={<Roadmap />} />
              
              {/* New Course Routes */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId/roadmap" element={<CourseRoadmapPage />} />
              <Route path="/courses/:courseId/modules/:moduleId/chat" element={<ChatTutorPage />} />
              <Route path="/lessons/:lessonId/editor" element={<CodeEditorPage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
