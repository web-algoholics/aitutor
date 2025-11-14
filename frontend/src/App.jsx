import { ConfigProvider, Layout } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import React from 'react';
import Dashboard from './pages/Dashboard';
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';

const { Content } = Layout;

function App() {
  return (
      <BrowserRouter>
        <Layout className="min-h-screen bg-gray-50">
          <Navbar /> {/* Always shown */}
            <Content>
                <Routes>
                  {/* Public Routes – No Navbar */}
                    <Route path="/login" element={<LoginPage title="Sign In" />} />
                    <Route path="/register" element={<RegisterPage title="Create Account" />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage title="Forgot Password" />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Protected Routes – With Navbar */}
                    <Route path="/dashboard" element={<Dashboard title="Dashboard" />} />
                    <Route path="/profile" element={<ProfilePage title="Profile" />} />
                </Routes>
            </Content>
        </Layout>
      </BrowserRouter>
  );
}

export default App;