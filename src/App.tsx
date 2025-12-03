import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { store } from './app/store';
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

const designTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: '#0f172a',
    colorPrimaryHover: '#1e293b',
    colorPrimaryActive: '#0f172a',
    colorTextBase: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextPlaceholder: '#94a3b8',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f8fafc',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#cbd5e1',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      borderRadius: 8,
      colorPrimary: '#0f172a',
      colorPrimaryHover: '#1e293b',
      colorPrimaryActive: '#0f172a',
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      hoverBorderColor: '#0f172a',
      activeBorderColor: '#0f172a',
      colorBorderHover: '#0f172a',
      paddingBlock: 10,
      paddingInline: 12,
    },
    Card: {
      borderRadiusLG: 12,
      colorBorder: '#e2e8f0',
      boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.08)',
      headerBg: 'transparent',
      headerFontSize: 18,
      headerFontWeight: 600,
    },
    Checkbox: {
      borderRadius: 4,
      colorPrimary: '#0f172a',
      colorPrimaryHover: '#1e293b',
    },
    Form: {
      labelFontSize: 14,
      labelColor: '#0f172a',
      itemMarginBottom: 20,
    },
    Message: {
      colorSuccess: '#10b981',
      colorError: '#ef4444',
      colorWarning: '#f59e0b',
      colorInfo: '#0ea5e9',
    },
  },
};

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
