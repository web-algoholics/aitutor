import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

export default function Footer() {
    const { theme } = useTheme();
    
    return(
<footer 
  className="border-t flex items-center px-8 h-16" 
  style={{ 
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
    borderColor: theme === 'dark' ? '#303030' : '#e5e7eb'
  }}
>
<div className="max-w-6xl mx-auto w-full flex items-center justify-between">
  <div className="flex items-center gap-3 text-sm" style={{ color: theme === 'dark' ? '#a1a1aa' : '#4b5563' }}>
    <span>© 2025 Web-algoholics</span>
  </div>
  <div className="flex items-center gap-6 text-sm" style={{ color: theme === 'dark' ? '#a1a1aa' : '#4b5563' }}>
    <Link to="/help" style={{ color: theme === 'dark' ? '#a1a1aa' : '#4b5563' }}>О проекте</Link>
    <Link to="/help" style={{ color: theme === 'dark' ? '#a1a1aa' : '#4b5563' }}>Вопросы и ответы</Link>
    <Link to="/help" style={{ color: theme === 'dark' ? '#a1a1aa' : '#4b5563' }}>Обратная связь</Link>
  </div>
</div>
</footer>
    );
}