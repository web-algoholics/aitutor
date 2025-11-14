import React, { useEffect } from 'react';
import { Form, Input, Button, message, Card, Result, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../services/authApi';
import AuthLayout from '../components/AuthLayout';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [resetPassword, { isLoading, isSuccess, isError, error }] = useResetPasswordMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!token) {
      messageApi.error('Invalid or missing reset token');
    }
  }, [token, messageApi]);

  const onFinish = async (values) => {
    if (values.password !== values.confirm) {
      form.setFields([{ name: 'confirm', errors: ['Passwords do not match'] }]);
      return;
    }
    try {
      await resetPassword({ token, password: values.password }).unwrap();
    } catch {
      // Error handled below
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <Result status="error" title="Invalid Link" subTitle="No reset token found." />
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Resetting password..." />
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <Result
          status="success"
          title="Password Reset!"
          subTitle="Your password has been changed successfully."
          extra={
            <Button type="primary" onClick={() => navigate('/login')}>
              Go to Sign In
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
          title="Reset Failed"
          subTitle={error?.data?.detail || 'Token may be expired or invalid.'}
          extra={
            <Button type="primary" onClick={() => navigate('/forgot-password')}>
              Try Again
            </Button>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password">
      {contextHolder}
      <div className="max-w-md mx-auto py-4">
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
            <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthLayout>
  );
}