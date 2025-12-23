import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  position?: 'fixed' | 'absolute' | 'relative';
  top?: string;
  right?: string;
  left?: string;
  bottom?: string;
  zIndex?: number;
}

export default function ThemeToggle({ 
  position = 'fixed', 
  top = '16px', 
  right = '16px', 
  left,
  bottom,
  zIndex = 1000 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ position, top, right, left, bottom, zIndex }}>
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
    </div>
  );
}

