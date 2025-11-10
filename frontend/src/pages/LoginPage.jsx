import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation, useGetCurrentUserQuery } from '../services/authApi';
import AuthLayout from '../components/AuthLayout';

export default function LoginPage() {
  const [login, { isLoading, isSuccess, error }] = useLoginMutation();
  const { data: user, isFetching } = useGetCurrentUserQuery(undefined, { skip: !isSuccess });
  const navigate = useNavigate();

  // HOOK-BASED MESSAGE
  const [messageApi, contextHolder] = message.useMessage();

  // Show error
  useEffect(() => {
    if (error) {
      const msg = error?.data?.detail || 'Invalid email or password';
      messageApi.error(msg);
    }
  }, [error, messageApi]);

  // Redirect after success
  useEffect(() => {
    if (isSuccess && !isFetching && user) {
      if (!user.is_verified) {
        messageApi.info('Please verify your email.');
        navigate('/verify');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isSuccess, isFetching, user, navigate, messageApi]);

  const onFinish = async (values) => {
    await login({ email: values.email, password: values.password }).unwrap();
  };

  return (
    <AuthLayout title="Sign In">
      {contextHolder} {/* Renders toast container */}
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Invalid email' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/forgot-password" className="text-sm">
              Forgot password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Sign In
          </Button>
        </Form.Item>

        <div className="text-center text-sm">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </div>
      </Form>
    </AuthLayout>
  );
}