import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { useVerifyEmailMutation } from '../services/profileApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyEmail, { isLoading, isSuccess, isError }] = useVerifyEmailMutation();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  if (!token) {
    return <Result status="error" title="Invalid Link" subTitle="No token provided." />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Verifying your email..." />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <Result
        status="success"
        title="Email Verified!"
        subTitle="Your email has been successfully verified."
        extra={
          <Button type="primary" onClick={() => navigate('/profile')}>
            Go to Profile
          </Button>
        }
      />
    );
  }

  if (isError) {
    return (
      <Result
        status="error"
        title="Verification Failed"
        subTitle="The token is invalid or expired."
        extra={
          <Button type="primary" onClick={() => navigate('/profile')}>
            Back to Profile
          </Button>
        }
      />
    );
  }

  return null;
}