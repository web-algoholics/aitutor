import React from 'react';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const join = (...parts: Array<string | undefined | false>) => parts.filter(Boolean).join(' ');

/**
 * Standard page wrapper used across app pages to keep identical width/padding.
 */
export default function PageContainer({ children, className, style }: PageContainerProps) {
  return (
    <div className={join('max-w-6xl mx-auto p-5 w-full', className)} style={style}>
      {children}
    </div>
  );
}


