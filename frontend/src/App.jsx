import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import React from 'react';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5' } }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;