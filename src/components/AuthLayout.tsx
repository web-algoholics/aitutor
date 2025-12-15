import { Card, CardProps } from 'antd';
import { Link } from 'react-router-dom';
import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card
        title={title}
        className="w-full max-w-md shadow-lg"
      >
        {children}
      </Card>
    </div>
  );
}
