import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../services/authApi';
import AuthLayout from '../components/AuthLayout';

interface ResetPasswordValues {
  password: string;
  confirm: string;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [resetPassword, { isLoading, isSuccess, isError, error }] = useResetPasswordMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ResetPasswordValues>();

  useEffect(() => {
    if (!token) {
      messageApi.error('Invalid or missing reset token');
    }
  }, [token, messageApi]);

  const onFinish = async (values: ResetPasswordValues) => {
    if (values.password !== values.confirm) {
      form.setFields([{ name: 'confirm', errors: ['Passwords do not match'] }]);
      return;
    }
    try {
      await resetPassword({ token: token!, password: values.password }).unwrap();
    } catch {
      // Error handled below
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-red-600">Invalid Link</p>
          <p className="text-gray-600 text-sm">No reset token found.</p>
        </div>
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-64">
          <p>Resetting password...</p>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-green-600 font-semibold">Password Reset!</p>
          <p className="text-gray-600 text-sm">Your password has been changed successfully.</p>
          <Button type="default" onClick={() => navigate('/login')} className="mt-4">
            Go to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (isError) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-red-600 font-semibold">Reset Failed</p>
          <p className="text-gray-600 text-sm">
            {error && 'data' in error && error.data && typeof error.data === 'object' && 'detail' in error.data
              ? (error.data as any).detail
              : 'Token may be expired or invalid.'}
          </p>
          <Button type="default" onClick={() => navigate('/forgot-password')} className="mt-4">
            Try Again
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password">
      {contextHolder}
      <div className="max-w-md mx-auto py-4">
        <Form<ResetPasswordValues> form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Enter new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            rules={[{ required: true, message: 'Confirm your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="default" htmlType="submit" loading={isLoading} block size="large">
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthLayout>
  );
}
