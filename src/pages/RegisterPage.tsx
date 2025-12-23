import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/authApi';
import AuthLayout from '../components/AuthLayout';
import type { FormInstance } from 'antd';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirm: string;
  agree: boolean;
}

export default function RegisterPage() {
  const [register, { isLoading, isSuccess, error }] = useRegisterMutation();
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterValues>();
  const [messageApi, contextHolder] = message.useMessage();

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
        : 'Не удалось зарегистрироваться';
      messageApi.error(msg);
    }
  }, [error, form, messageApi]);

  // SUCCESS REDIRECT
  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Проверьте email, чтобы подтвердить аккаунт');
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
    <AuthLayout title="Создать аккаунт">
      {contextHolder}
      <Form<RegisterValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Username */}
        <Form.Item
          label="Имя пользователя"
          name="username"
          rules={[{ required: true, message: 'Введите имя пользователя' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="john_doe" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Неверный формат email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@example.com" />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label="Пароль"
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 8, message: 'Пароль должен быть не менее 8 символов' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Минимум 8 символов" />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label="Подтверждение пароля"
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Подтвердите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Повторите пароль" />
        </Form.Item>

        {/* Terms */}
        <Form.Item
          name="agree"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('Нужно принять условия использования')),
            },
          ]}
        >
          <Checkbox>
            Я принимаю{' '}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">
              Условия использования
            </Link>{' '}
            и{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">
              Политику конфиденциальности
            </Link>
          </Checkbox>
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Зарегистрироваться
          </Button>
        </Form.Item>

        {/* Login Link */}
        <div className="text-center text-sm">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-sm hover:text-black hover:underline">
            Войти
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
}
