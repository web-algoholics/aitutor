import React from 'react';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';

function App() {
  return (
    <ConfigProvider>
      <div className="min-h-screen bg-gray-300">
        <h1 className="text-3xl font-bold text-center text-indigo-600 p-8">
          Welcome to AI Tutor
        </h1>
      </div>
    </ConfigProvider>
  );
}

export default App;