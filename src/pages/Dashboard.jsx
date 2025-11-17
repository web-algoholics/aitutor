import React from 'react';
import AuthLayout from '../components/AuthLayout';

export default function Dashboard() {
  return (
    <AuthLayout title="Dashboard">
        <h2 className="text-xl font-semibold">Welcome back!</h2>
        <p className="text-gray-600 mt-2">This is your dashboard.</p>
    </AuthLayout>
  );
}