import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/authApi';
import AuthLayout from '../components/AuthLayout';

export default function RegisterPage() {
  const [register, { isLoading, isSuccess, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Check your email to verify.');
      navigate('/login');
    }
  }, [isSuccess, navigate, messageApi]);

  useEffect(() => {
    if (error) {
      messageApi.error(error?.data?.detail || 'Registration failed');
    }
  }, [error, messageApi]);

  const onFinish = async (values) => {
    try {
      await register({
        email: values.email,
        password: values.password,
        username: values.username,
      }).unwrap();
    } catch (err) {
      message.error(err?.data?.detail || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout title="Create Account">
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* Username */}
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please enter a username' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="e.g. john_doe" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@example.com" />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="At least 8 characters"
          />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label="Confirm Password"
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Repeat your password"
          />
        </Form.Item>

        {/* Terms */}
        <Form.Item
          name="agree"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error('You must accept the terms')),
            },
          ]}
        >
          <Checkbox>
            I accept the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </Checkbox>
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Sign Up
          </Button>
        </Form.Item>

        {/* Login link */}
        <div className="text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
}