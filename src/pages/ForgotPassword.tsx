import React from 'react';
import { Form, Input, Button, message, Typography, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/authApi';
import AuthLayout, { useCircleAnimation } from '../components/AuthLayout';

const { Text } = Typography;

interface ForgotPasswordValues {
  email: string;
}

function isFetchBaseQueryError(error: unknown): error is { status: number; data?: any } {
  return (
    typeof error === 'object' && error !== null && 'status' in error
  );
}

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading, error, isSuccess }] = useForgotPasswordMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ForgotPasswordValues>();

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

  const onFinish = async (values: ForgotPasswordValues) => {
    try {
      await forgotPassword(values.email).unwrap();
      form.resetFields();
    } catch {
      // Error handled via Alert component
    }
  };

  return (
    <AuthLayout title="Восстановление пароля">
      {contextHolder}
      <div style={{ minHeight: 24, marginBottom: 20, pointerEvents: 'none' }}>
        {isSuccess && (
          <Alert
            message="Ссылка для сброса пароля отправлена на ваш email!"
            type="success"
            showIcon={false}
            style={{
              background: 'transparent', border: 'none', color: '#52c41a', fontSize: 14, padding: 0
            }}
          />
        )}
        {error && isFetchBaseQueryError(error) && !isSuccess && (
          <Alert
            message={'data' in error && error.data && typeof error.data === 'object' && 'detail' in error.data
              ? (error.data as any).detail
              : 'Не удалось отправить ссылку для сброса пароля'}
            type="error"
            showIcon={false}
            style={{
              background: 'transparent', border: 'none', color: '#e53935', fontSize: 14, padding: 0
            }}
          />
        )}
      </div>
      <Form<ForgotPasswordValues> 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        style={{ width: 'min(320px, 100%)', margin: '0 auto' }}
      >
        <Text type="secondary" className="block text-center mb-6">
          Введите email — мы отправим ссылку для сброса пароля.
        </Text>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный формат email' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#2B5797' }} />} placeholder="user@example.com" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
              Отправить ссылку
            </Button>
          </Form.Item>
      </Form>
    </AuthLayout>
  );
}
