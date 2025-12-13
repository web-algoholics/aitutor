import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import LandingPage from './pages/LandingPage';
import React from 'react';
import Dashboard, { CoursePage } from './pages/Dashboard';
import ProtectedLayout from './components/ProtectedLayout';
import PublicLayout from './components/PublicLayout';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={designTheme}>
        <BrowserRouter basename='/aitutor'>
          <Routes>

            {/* Public Routes with Layout (navbar + footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            {/* Public Routes (no navbar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected Routes (with navbar) */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses/:language" element={<CoursePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/roadmap" element={<Roadmap />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
