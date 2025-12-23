import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import LoadingDot from '../components/LoadingDot';
import { useVerifyEmailMutation } from '../services/profileApi';
import AuthLayout from '../components/AuthLayout';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-red-600">Invalid Link</p>
          <p className="text-gray-600 text-sm">No verification token found.</p>
        </div>
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <LoadingDot size="large" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-green-600 font-semibold">Email Verified!</p>
          <p className="text-gray-600 text-sm">You can now use all features.</p>
          <Button type="primary" onClick={() => navigate('/profile')} className="mt-4">
            Go to Profile
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (isError) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-red-600 font-semibold">Verification Failed</p>
          <p className="text-gray-600 text-sm">
            {error && 'data' in error && error.data && typeof error.data === 'object' && 'detail' in error.data
              ? (error.data as any).detail
              : 'Invalid or expired token.'}
          </p>
          <Button type="primary" onClick={() => navigate('/profile')} className="mt-4">
            Back to Profile
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return null;
}
