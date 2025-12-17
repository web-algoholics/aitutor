import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation, useGetCurrentUserQuery } from '../services/authApi';
import AuthLayout, { useCircleAnimation } from '../components/AuthLayout';

interface LoginValues {
  email: string;
  password: string;
  remember?: boolean;
}

export default function LoginPage() {
  const [login, { isLoading, isSuccess, error }] = useLoginMutation();
  const { data: user, isFetching } = useGetCurrentUserQuery(undefined, { skip: !isSuccess });
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginValues>();
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
          name: fieldName === 'username' ? 'email' : fieldName,
          errors: [err.msg],
        };
      });
      form.setFields(fieldErrors);
    } else if (error) {
      messageApi.error('Неверный логин или пароль');
    }
  }, [error, form, messageApi]);

  // SUCCESS REDIRECT
  useEffect(() => {
    if (isSuccess && !isFetching && user) {
      if (!('is_verified' in user) || !user.is_verified) {
        messageApi.info('Пожалуйста, подтвердите email.');
        navigate('/theory');
      } else {
        navigate('/theory');
      }
    }
  }, [isSuccess, isFetching, user, navigate, messageApi]);

  const onFinish = async (values: LoginValues) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      }).unwrap();
    } catch {
      // 422 handled in useEffect
    }
  };

  return (
    <AuthLayout title="Вход">
      {contextHolder}
      <Form<LoginValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        style={{ width: 'min(320px, 100%)', margin: '0 auto' }}
      >
        <Form.Item
          label="Email или имя пользователя"
          name="email"
          rules={[
            { required: true, message: 'Введите email или имя пользователя' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>
            <CollapseLink to="/forgot-password" className="text-sm hover:text-black hover:underline">
              Забыли пароль?
            </CollapseLink>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Войти
          </Button>
        </Form.Item>

        <div className="text-center text-sm">
          Нет аккаунта? <CollapseLink to="/register" className="hover:text-black hover:underline">Зарегистрироваться</CollapseLink>
        </div>
      </Form>
    </AuthLayout>
  );
}
