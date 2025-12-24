import React, { useEffect } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/authApi';
import AuthLayout, { useCircleAnimation } from '../components/AuthLayout';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
}

function isFetchBaseQueryError(error: unknown): error is { status: number; data?: any } {
  return (
    typeof error === 'object' && error !== null && 'status' in error
  );
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
    style,
  }: {
    to: string;
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => {
    const { collapse } = useCircleAnimation();
    const innerNavigate = useNavigate();

    return (
      <Link
        to={to}
        className={className}
        style={style}
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
    }
  }, [error, form]);

  // SUCCESS REDIRECT
  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Проверьте почту: мы отправили письмо для подтверждения аккаунта.');
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
    <AuthLayout title="Регистрация">
      {contextHolder}
      <div style={{ minHeight: 24, marginBottom: 20, pointerEvents: 'none' }}>
        {error && isFetchBaseQueryError(error) && !(error.status === 422 && error.data && typeof error.data === 'object' && 'detail' in error.data) && (
          <Alert
            message={'data' in error && error.data && typeof error.data === 'object' && 'detail' in error.data
              ? (error.data as any).detail
              : 'Не удалось зарегистрироваться'}
            type="error"
            showIcon={false}
            style={{
              background: 'transparent', border: 'none', color: '#e53935', fontSize: 14, padding: 0
            }}
          />
        )}
      </div>
      <Form<RegisterValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        style={{ width: 'min(320px, 100%)', margin: '0 auto' }}
      >
        {/* Username */}
        <Form.Item
          label="Имя пользователя"
          name="username"
          rules={[{ required: true, message: 'Введите имя пользователя' }]}
        >
          <Input 
            prefix={<UserOutlined style={{ color: '#2B5797' }} />} 
            placeholder="john_doe"
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Некорректный формат email' },
          ]}
        >
          <Input 
            prefix={<MailOutlined style={{ color: '#2B5797' }} />} 
            placeholder="user@example.com"
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label="Пароль"
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 8, message: 'Пароль должен быть не короче 8 символов' },
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined style={{ color: '#2B5797' }} />} 
            placeholder="Минимум 8 символов"
          />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading} 
            block
            style={{ backgroundColor: '#2B5797', borderColor: '#2B5797', color: '#fff' }}
          >
            Зарегистрироваться
          </Button>
        </Form.Item>

        {/* Login Link */}
        <div className="text-center text-sm">
          <div>Уже есть аккаунт?</div>
          <div>
            <CollapseLink to="/login" className="text-sm hover:text-black hover:underline" style={{ color: '#2B5797' }}>Войти</CollapseLink>
          </div>
        </div>
      </Form>
    </AuthLayout>
  );
}
