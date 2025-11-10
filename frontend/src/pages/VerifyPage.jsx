import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import React from 'react';

export default function VerifyPage() {
  return (
    <AuthLayout title="Verify Your Email">
      <Result
        status="info"
        title="Check Your Email"
        subTitle="We sent a verification link. Click it to activate your account."
        extra={
          <Button type="primary" className="bg-indigo-600">
            <Link to="/login">Back to Login</Link>
          </Button>
        }
      />
    </AuthLayout>
  );
}