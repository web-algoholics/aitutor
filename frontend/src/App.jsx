import { ConfigProvider, Layout } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import Roadmap from './pages/Roadmap';
import React from 'react';
import Dashboard from './pages/Dashboard';
import AuthLayout from './components/AuthLayout';
import ProtectedLayout from './components/ProtectedLayout';
import Navbar from './components/Navbar';

const { Content } = Layout;

function App() {
  return (
      <BrowserRouter>
        <Routes>

          {/* Public Routes (no navbar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected Routes (with navbar) */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/roadmap" element={<Roadmap />} />
          </Route>

        </Routes>
      </BrowserRouter>
  );
}

export default App;