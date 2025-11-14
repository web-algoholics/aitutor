import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Avatar, message, Card, Row, Col, Space, Typography, Upload, Modal } from 'antd';
import { EditOutlined, MailOutlined, GiftOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CameraOutlined } from '@ant-design/icons';
import { useGetProfileQuery, useUpdateProfileMutation, useRequestVerifyTokenMutation, useUploadAvatarMutation, useGetAvatarQuery } from '../services/profileApi';
import AuthLayout from '../components/AuthLayout';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const navigate = useNavigate();

  // --- RTK Query ---
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const { data: avatarData } = useGetAvatarQuery(undefined, { skip: !profile?.profile_icon_filename });
  const [updateProfile, { isSuccess, isError, error: updateError, isLoading: isUpdating }] = useUpdateProfileMutation();
  const [requestVerifyToken] = useRequestVerifyTokenMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();

  // --- State ---
  const [editMode, setEditMode] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // --- Avatar ---
  const avatarUrl = avatarData?.image || `https://via.placeholder.com/80?text=${profile?.first_name?.[0] || 'U'}`;

  // --- Save Original Values When Entering Edit Mode ---
  const [originalValues, setOriginalValues] = useState({});

  useEffect(() => {
    if (profile) {
      const values = {
        username: profile.username || '',
        email: profile.email || '',
      };
      form.setFieldsValue(values);
      if (!editMode) {
        setOriginalValues(values); // Save as original
      }
    }
  }, [profile, form, editMode]);

  // --- Show Success/Error Messages ---
  useEffect(() => {
    if (isSuccess) {
      messageApi.success('Profile updated successfully');
      setEditMode(false);
      refetch();
    }
    if (isError) {
      const msg = updateError?.data?.detail?.[0]?.msg || 'Failed to update profile';
      messageApi.error(msg);
    }
  }, [isSuccess, isError, updateError, messageApi, refetch]);

  // --- Handlers ---
  const onFinish = async (values) => {
    try {
      await updateProfile(values).unwrap();
    } catch {
      // Handled in useEffect
    }
  };

  const onPasswordChange = async (values) => {
    if (values.new_password !== values.confirm_password) {
      pwdForm.setFields([{ name: 'confirm_password', errors: ['Passwords do not match'] }]);
      return;
    }
    try {
      await updateProfile({ password: values.new_password }).unwrap();
      messageApi.success('Password changed');
      setPwdModal(false);
      pwdForm.resetFields();
    } catch (err) {
      messageApi.error(err?.data?.detail?.[0]?.msg || 'Password change failed');
    }
  };

  const handleVerify = async () => {
    if (!profile?.email) {
      messageApi.error('Email not found');
      return;
    }
    try {
      messageApi.success('Verification email sent!');
      await requestVerifyToken(profile.email).unwrap(); // sends JSON
    } catch (err) {
      messageApi.error(err?.data?.detail?.[0]?.msg || 'Failed to send email');
    }
  };

  const handleAvatarUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadAvatar(formData).unwrap();
      messageApi.success('Avatar updated');
      refetch();
    } catch {
      messageApi.error('Upload failed');
    }
  };

  // --- Enter Edit Mode ---
  const enterEditMode = () => {
    const current = form.getFieldsValue();
    setOriginalValues(current);
    setEditMode(true);
  };

  // --- Cancel Edit ---
  const cancelEdit = () => {
    form.setFieldsValue(originalValues);
    setEditMode(false);
  };

  // --- Loading ---
  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {contextHolder}

      {/* Header */}
      <Card className="mb-6 w-full shadow-sm">
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
              <Title level={4} className="m-0">{profile?.username}</Title>
              <Space size={4} className="text-gray-600">
                <MailOutlined />
                <Text>{profile?.email}</Text>
              </Space>
            </div>
          </div>
          <Button type="primary" icon={<EditOutlined />} onClick={enterEditMode} disabled={editMode}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Profile Form */}
      <Card title="Profile Information" className="w-full shadow-sm">
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={!editMode}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Username" name="username">
                <Input prefix={<EditOutlined className="text-gray-400" />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email Address" name="email">
                <Input prefix={<MailOutlined className="text-gray-400" />} />
              </Form.Item>
            </Col>
          </Row>

          {editMode && (
            <Form.Item className="text-right mb-0">
              <Space>
                <Button onClick={cancelEdit}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isUpdating}>Save Changes</Button>
              </Space>
            </Form.Item>
          )}
        </Form>

        {/* Email Verification */}
        {!profile?.is_verified ? (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Space>
              <ExclamationCircleOutlined className="text-yellow-600" />
              <Text className="text-yellow-800">
                Your email is not verified.{' '}
                <Button type="link" onClick={handleVerify} className="p-0 h-auto">
                  Verify Email
                </Button>
              </Text>
            </Space>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Space>
              <CheckCircleOutlined className="text-green-600" />
              <Text className="text-green-800">Email verified</Text>
            </Space>
          </div>
        )}

        {/* Change Password */}
        <div className="mt-8">
          <Button type="default" onClick={() => setPwdModal(true)}>
            Change Password
          </Button>
        </div>
      </Card>

      {/* Password Modal */}
      <Modal
        title="Change Password"
        open={pwdModal}
        onCancel={() => { setPwdModal(false); pwdForm.resetFields(); }}
        footer={null}
      >
        <Form form={pwdForm} layout="vertical" onFinish={onPasswordChange}>
          <Form.Item
            name="new_password"
            rules={[
              { required: true, message: 'Enter new password' },
              { min: 8, message: 'Minimum 8 characters' },
            ]}
          >
            <Input.Password placeholder="New password" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            rules={[{ required: true, message: 'Confirm new password' }]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => { setPwdModal(false); pwdForm.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Update Password</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}