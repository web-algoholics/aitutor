import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/authApi';
import AuthLayout from '../components/AuthLayout';

export default function RegisterPage() {
  const [register, { isLoading, isSuccess, error }] = useRegisterMutation();
  const navigate = useNavigate();

  // ADD FORM INSTANCE
  const [form] = Form.useForm();

  // HOOK-BASED MESSAGE
  const [messageApi, contextHolder] = message.useMessage();

  // HANDLE 422 + FIELD ERRORS
  useEffect(() => {
    if (error?.status === 422 && error?.data?.detail) {
      const fieldErrors = error.data.detail.map(err => {
        const fieldName = err.loc[err.loc.length - 1]; // "username", "email", "password"
        return {
          name: fieldName,
          errors: [err.msg],
        };
      });
      form.setFields(fieldErrors);
    } else if (error) {
      const msg = typeof error?.data?.detail === 'string'
        ? error.data.detail
        : 'Registration failed';
      messageApi.error(msg);
    }
  }, [error, form, messageApi]);

  // SUCCESS REDIRECT
  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Check your email to verify your account.');
      navigate('/login');
    }
  }, [isSuccess, navigate, messageApi]);

  const onFinish = async (values) => {
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
      }).unwrap();
    } catch {
      // 422 handled in useEffect
    }
  };

  return (
    <AuthLayout title="Create Account">
      {contextHolder}
      <Form
        form={form}  // ← ADD THIS
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Username */}
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please enter a username' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="john_doe" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Invalid email format' },
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
          <Input.Password prefix={<LockOutlined />} placeholder="At least 8 characters" />
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
          <Input.Password prefix={<LockOutlined />} placeholder="Repeat password" />
        </Form.Item>

        {/* Terms */}
        <Form.Item
          name="agree"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms')),
            },
          ]}
        >
          <Checkbox>
            I accept the{' '}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Link>
          </Checkbox>
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Sign Up
          </Button>
        </Form.Item>

        {/* Login Link */}
        <div className="text-center text-sm">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </Form>
    </AuthLayout>
  );
}