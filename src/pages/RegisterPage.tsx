import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/authApi';
import AuthLayout, { useCircleAnimation } from '../components/AuthLayout';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [register, { isLoading, isSuccess, error }] = useRegisterMutation();
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const CollapseLink = ({
    to,
    className,
    children,
  }: {
    to: string;
    className?: string;
    children: React.ReactNode;
  }) => {
    const { collapse } = useCircleAnimation();
    const innerNavigate = useNavigate();

    return (
      <Link
        to={to}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          collapse();
          setTimeout(() => innerNavigate(to), 320);
        }}
      >
        {children}
      </Link>
    );
  };

  // HANDLE 422 + FIELD ERRORS
  useEffect(() => {
    if (error && 'status' in error && error.status === 422 && 'data' in error && error.data && typeof error.data === 'object' && 'detail' in error.data) {
      const errorData = error.data as any;
      const fieldErrors = errorData.detail.map((err: any) => {
        const fieldName = err.loc[err.loc.length - 1];
        return {
          name: fieldName,
          errors: [err.msg],
        };
      });
      form.setFields(fieldErrors);
    } else if (error) {
      const msg = 'data' in error && error.data && typeof error.data === 'object' && 'detail' in error.data
        ? (error.data as any).detail
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

  const onFinish = async (values: RegisterValues) => {
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
      <Form<RegisterValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        style={{ width: 'min(320px, 100%)', margin: '0 auto' }}
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

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Sign Up
          </Button>
        </Form.Item>

        {/* Login Link */}
        <div className="text-center text-sm">
          Already have an account? <CollapseLink to="/login" className="text-sm hover:text-black hover:underline">Sign in</CollapseLink>
        </div>
      </Form>
    </AuthLayout>
  );
}
