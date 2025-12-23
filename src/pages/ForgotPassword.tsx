import React from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/authApi';
import AuthLayout, { useCircleAnimation } from '../components/AuthLayout';

const { Title, Text } = Typography;

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ForgotPasswordValues>();
  const navigate = useNavigate();

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
      messageApi.success('Ссылка для сброса пароля отправлена на ваш email!');
      form.resetFields();
    } catch (err: any) {
      messageApi.error(err?.data?.detail || 'Не удалось отправить ссылку для сброса');
    }
  };

  return (
    <AuthLayout title="Восстановление пароля">
      {contextHolder}
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
            <Input prefix={<MailOutlined style={{ color: '#2B5797' }} />} placeholder="you@example.com" size="large" />
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
