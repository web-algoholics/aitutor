import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Avatar, message, Card, Row, Col, Space, Typography, Upload } from 'antd';
import CustomModal from '../components/CustomModal';
import { EditOutlined, MailOutlined, GiftOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CameraOutlined } from '@ant-design/icons';
import { useGetProfileQuery, useUpdateProfileMutation, useRequestVerifyTokenMutation, useUploadAvatarMutation, useGetAvatarQuery } from '../services/profileApi';
import AuthLayout from '../components/AuthLayout';
import { useNavigate } from 'react-router-dom';
import Stats from '../components/Stats';
import PageContainer from '../components/PageContainer';
import LoadingDot from '../components/LoadingDot';


const { Title, Text } = Typography;

interface ProfileFormValues {
  username: string;
  email: string;
}

interface PasswordChangeValues {
  new_password: string;
  confirm_password: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const { data: profile, isLoading, refetch } = useGetProfileQuery(undefined);
  const { data: avatarData } = useGetAvatarQuery(undefined, { skip: !profile?.profile_icon_filename } as any);
  const [updateProfile, { isSuccess, isError, error: updateError, isLoading: isUpdating }] = useUpdateProfileMutation();
  const [requestVerifyToken] = useRequestVerifyTokenMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();

  const [editMode, setEditMode] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [form] = Form.useForm<ProfileFormValues>();
  const [pwdForm] = Form.useForm<PasswordChangeValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const avatarUrl = avatarData?.image || `https://via.placeholder.com/80?text=${profile?.first_name?.[0] || 'U'}`;

  const [originalValues, setOriginalValues] = useState<ProfileFormValues>({
    username: '',
    email: '',
  });

  useEffect(() => {
    if (profile) {
      const values: ProfileFormValues = {
        username: ('username' in profile ? profile.username : '') || '',
        email: ('email' in profile ? profile.email : '') || '',
      };
      form.setFieldsValue(values);
      if (!editMode) {
        setOriginalValues(values);
      }
    }
  }, [profile, form, editMode]);

  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Профиль успешно обновлён');
      setEditMode(false);
      refetch();
    }
    if (isError) {
      const msg = updateError && 'data' in updateError && updateError.data && typeof updateError.data === 'object' && 'detail' in updateError.data
        ? (updateError.data as any).detail?.[0]?.msg || 'Не удалось обновить профиль'
        : 'Не удалось обновить профиль';
      messageApi.error(msg);
    }
  }, [isSuccess, isError, updateError, messageApi, refetch]);

  const onFinish = async (values: ProfileFormValues) => {
    try {
      await updateProfile(values).unwrap();
    } catch {
      // Handled in useEffect
    }
  };

  const onPasswordChange = async (values: PasswordChangeValues) => {
    if (values.new_password !== values.confirm_password) {
      pwdForm.setFields([{ name: 'confirm_password', errors: ['Пароли не совпадают'] }]);
      return;
    }
    try {
      await updateProfile({ password: values.new_password }).unwrap();
      messageApi.success('Пароль изменён');
      setPwdModal(false);
      pwdForm.resetFields();
    } catch (err: any) {
      messageApi.error(err?.data?.detail?.[0]?.msg || 'Не удалось изменить пароль');
    }
  };

  const handleVerify = async () => {
    if (!profile || !('email' in profile) || !profile.email) {
      messageApi.error('Email не найден');
      return;
    }
    try {
      messageApi.success('Письмо для подтверждения отправлено!');
      await requestVerifyToken(profile.email as string).unwrap();
    } catch (err: any) {
      messageApi.error(err?.data?.detail?.[0]?.msg || 'Не удалось отправить письмо');
    }
  };

  const handleAvatarUpload = async (info: any) => {
    const file = info.file;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadAvatar(formData).unwrap();
      messageApi.success('Аватар обновлён');
      refetch();
    } catch {
      messageApi.error('Не удалось загрузить файл');
    }
  };

  const enterEditMode = () => {
    const current = form.getFieldsValue();
    setOriginalValues(current);
    setEditMode(true);
  };

  const cancelEdit = () => {
    form.setFieldsValue(originalValues);
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingDot size="large" />
        </div>
      </PageContainer>
    );
  }
  if (!profile) navigate("/login");

  return (
    <PageContainer>
      {contextHolder}

      {/* Header */}
      <Card bordered={false} className="mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Upload
              customRequest={handleAvatarUpload}
              showUploadList={false}
              accept="image/*"
              disabled={isUploading}
            >
              <Avatar
                size={80}
                src={avatarUrl}
                icon={<CameraOutlined />}
                className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500"
              />
            </Upload>
            <div>
              <Title level={4} className="m-0">{profile && 'username' in profile ? profile.username : 'Пользователь'}</Title>
              <Space size={4} style={{ color: '#4b5563' }}>
                <MailOutlined style={{ color: 'hsl(var(--primary))' }} />
                <Text>{profile && 'email' in profile ? profile.email : 'Загрузка...'}</Text>
              </Space>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card bordered={false} title="Информация профиля" className="shadow-sm">
        <Form<ProfileFormValues> form={form} layout="vertical" onFinish={onFinish} disabled={!editMode}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Имя пользователя" name="username">
                <Input 
                  prefix={<EditOutlined className="text-gray-400" />} 
                  style={!editMode 
                    ? { color: '#4b5563' } 
                    : { color: 'hsl(var(--foreground))' }
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input 
                  prefix={<MailOutlined className="text-gray-400" />} 
                  style={!editMode 
                    ? { color: '#4b5563' } 
                    : { color: 'hsl(var(--foreground))' }
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div className="text-right" style={{ marginTop: '16px' }}>
          <Space>
            {editMode ? (
              <>
                <Button onClick={cancelEdit}>Отмена</Button>
                <Button type="primary" onClick={() => form.submit()} loading={isUpdating}>Сохранить</Button>
              </>
            ) : (
              <Button type="primary" icon={<EditOutlined />} onClick={enterEditMode}>
                Редактировать
              </Button>
            )}
          </Space>
        </div>

        {/* Email Verification */}
        {profile && 'is_verified' in profile && !profile.is_verified ? (
          <div className="mt-6 p-4 rounded-lg" style={{ 
            backgroundColor: 'hsl(var(--accent))',
            border: '2px solid hsl(var(--border))',
            borderColor: '#eab308'
          }}>
            <Space size="middle" style={{ width: '100%', alignItems: 'flex-start' }}>
              <ExclamationCircleOutlined style={{ fontSize: '18px', marginTop: '2px', color: 'hsl(var(--primary))' }} />
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', display: 'block', marginBottom: '8px', color: 'hsl(var(--foreground))' }}>
                  Email не подтверждён
                </Text>
                <Button 
                  type="link" 
                  onClick={handleVerify} 
                  style={{ 
                    padding: 0, 
                    height: 'auto', 
                    color: 'hsl(var(--primary))',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  Отправить письмо для подтверждения
                </Button>
              </div>
            </Space>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <Space size="middle" style={{ width: '100%' }}>
              <CheckCircleOutlined className="text-green-600" style={{ fontSize: '18px' }} />
              <Text className="text-green-900" style={{ fontSize: '14px', fontWeight: 500 }}>Email подтверждён</Text>
            </Space>
          </div>
        )}

        {/* Change Password */}
        <div className="mt-8">
          <Button type="default" onClick={() => setPwdModal(true)}>
            Сменить пароль
          </Button>
        </div>
      </Card>

      {/* Password Modal */}
      <CustomModal
        title="Смена пароля"
        open={pwdModal}
        onClose={() => { setPwdModal(false); pwdForm.resetFields(); }}
        footer={
          <Space>
            <Button onClick={() => { setPwdModal(false); pwdForm.resetFields(); }}>Отмена</Button>
            <Button type="primary" onClick={() => pwdForm.submit()}>Обновить пароль</Button>
          </Space>
        }
      >
        <Form<PasswordChangeValues> form={pwdForm} layout="vertical" onFinish={onPasswordChange}>
          <Form.Item
            name="new_password"
            rules={[
              { required: true, message: 'Введите новый пароль' },
              { min: 8, message: 'Минимум 8 символов' },
            ]}
          >
            <Input.Password placeholder="Новый пароль" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            rules={[{ required: true, message: 'Повторите новый пароль' }]}
          >
            <Input.Password placeholder="Повторите новый пароль" />
          </Form.Item>
        </Form>
      </CustomModal>

      {/* Stats Section */}
      <Card bordered={false} title="Статистика обучения" className="shadow-sm mt-6">
        <Stats />
      </Card>
    </PageContainer>
  );
}
