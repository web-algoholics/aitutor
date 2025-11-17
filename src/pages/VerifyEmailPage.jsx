import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { useVerifyEmailMutation } from '../services/profileApi';
import AuthLayout from '../components/AuthLayout';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyEmail(token); // sends JSON
    }
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <AuthLayout>
        <Result status="error" title="Invalid Link" subTitle="No verification token found." />
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Verifying your email..." />
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <Result
          status="success"
          title="Email Verified!"
          subTitle="You can now use all features."
          extra={
            <Button type="primary" onClick={() => navigate('/profile')}>
              Go to Profile
            </Button>
          }
        />
      </AuthLayout>
    );
  }

  if (isError) {
    return (
      <AuthLayout>
        <Result
          status="error"
          title="Verification Failed"
          subTitle={error?.data?.detail?.[0]?.msg || 'Invalid or expired token.'}
          extra={
            <Button type="primary" onClick={() => navigate('/profile')}>
              Back to Profile
            </Button>
          }
        />
      </AuthLayout>
    );
  }

  return null;
}