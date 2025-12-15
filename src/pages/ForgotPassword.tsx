import React from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/authApi';
import AuthLayout from '../components/AuthLayout';

const { Title, Text } = Typography;

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ForgotPasswordValues>();
  const navigate = useNavigate();

  const onFinish = async (values: ForgotPasswordValues) => {
    try {
      await forgotPassword(values.email).unwrap();
      messageApi.success('Password reset link sent to your email!');
      form.resetFields();
    } catch (err: any) {
      messageApi.error(err?.data?.detail || 'Failed to send reset link');
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      {contextHolder}
      <div className="max-w-md mx-auto py-4">
        <Title level={4} className="text-center mb-6">Reset Your Password</Title>
        <Text type="secondary" className="block text-center mb-6">
          Enter your email and we'll send you a link to reset your password.
        </Text>

        <Form<ForgotPasswordValues> form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
              Send Reset Link
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link to="/login" className='hover:text-black'>Back to Sign In</Link>
          </div>
        </Form>
      </div>
    </AuthLayout>
  );
}
