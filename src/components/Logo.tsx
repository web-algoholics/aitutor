import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Logo({ to = "/theory", className = "", style }: LogoProps) {
  const textClassName = `text-black ${to ? 'hover:text-gray-500' : ''} ${className || 'text-2xl'}`;
  
  return (
    <div className="font-bold font-source-sans" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
      {to ? (
        <Link to={to} className={textClassName} style={{ ...style, display: 'inline-block', whiteSpace: 'nowrap' }}>
          EdGen<span style={{ color: '#2B5797' }}>.</span>
        </Link>
      ) : (
        <span className={textClassName} style={{ ...style, display: 'inline-block', whiteSpace: 'nowrap' }}>
          EdGen<span style={{ color: '#2B5797' }}>.</span>
        </span>
      )}
    </div>
  );
}



