import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  genColor?: string;
  dotColor?: string;
}

export default function Logo({ to = "/theory", className = "", style, genColor, dotColor }: LogoProps) {
  const textClassName = `${to ? 'hover:text-gray-500' : ''} ${className || 'text-2xl'}`;
  const genColorValue = genColor || '#000';
  const dotColorValue = dotColor || '#000';
  
  return (
    <div className="font-bold font-source-sans" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
      {to ? (
        <Link to={to} className={textClassName} style={{ ...style, display: 'inline-block', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#2B5797' }}>Ed</span><span style={{ color: genColorValue, transition: 'color 1.2s ease' }}>Gen</span><span style={{ color: dotColorValue, transition: 'color 1.2s ease' }}>.</span>
        </Link>
      ) : (
        <span className={textClassName} style={{ ...style, display: 'inline-block', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#2B5797' }}>Ed</span><span style={{ color: genColorValue, transition: 'color 1.2s ease' }}>Gen</span><span style={{ color: dotColorValue, transition: 'color 1.2s ease' }}>.</span>
        </span>
      )}
    </div>
  );
}



