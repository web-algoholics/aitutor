import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

export default function PublicHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header 
      className="flex items-center justify-between px-8 h-16 border-b sticky top-0 z-50" 
      style={{ 
        backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff', 
        borderColor: theme === 'dark' ? '#303030' : '#e5e7eb' 
      }}
    >
      <Logo to="/" />
      
      <Button
        type="text"
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        size="middle"
        style={{ 
          color: theme === 'dark' ? '#fafafa' : '#2B5797',
          fontSize: '18px'
        }}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      />
    </header>
  );
}

