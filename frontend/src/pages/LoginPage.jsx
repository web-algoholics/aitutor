// src/pages/LoginPage.jsx
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
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // HANDLE 422 + FIELD ERRORS
  useEffect(() => {
    if (error?.status === 422 && error?.data?.detail) {
      const fieldErrors = error.data.detail.map(err => {
        const fieldName = err.loc[err.loc.length - 1]; // "username" or "password"
        return {
          name: fieldName === 'username' ? 'email' : fieldName, // ← Map back to form field
          errors: [err.msg],
        };
      });
      form.setFields(fieldErrors);
    } else if (error) {
      messageApi.error('Invalid username or password');
    }
  }, [error, form, messageApi]);

  // SUCCESS REDIRECT
  useEffect(() => {
    if (isSuccess && !isFetching && user) {
      if (!user.is_verified) {
        messageApi.info('Please verify your email.');
        navigate('/dashboard');;
      } else {
        navigate('/dashboard');
      }
    }
  }, [isSuccess, isFetching, user, navigate, messageApi]);

  const onFinish = async (values) => {
    try {
      await login({
        email: values.email,       // ← From form
        password: values.password,
      }).unwrap();
    } catch {
      // 422 handled in useEffect
    }
  };

  return (
    <AuthLayout title="Sign In">
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="Email or Username"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email or username' },
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