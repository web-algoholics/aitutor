import React from 'react';
import Logo from './Logo';

export default function PublicHeader() {
  return (
    <header className="flex items-center justify-between px-8 h-16 border-b border-border bg-background sticky top-0 z-50">
      <Logo to="/" />
    </header>
  );
}

