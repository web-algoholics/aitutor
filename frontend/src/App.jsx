import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import React from 'react';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5' } }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;