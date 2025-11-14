// src/components/Navbar.jsx
import React from 'react';
import { Layout, Avatar, Dropdown, Menu, Button, Space } from 'antd';
import { UserOutlined, ProfileOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGetProfileQuery, useGetAvatarQuery } from '../services/profileApi';
import { useLogoutMutation } from '../services/authApi';

const { Header } = Layout;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Auth state
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: avatarData } = useGetAvatarQuery(undefined, {
    skip: !profile?.profile_icon_filename,
  });
  const [logout] = useLogoutMutation();

  const isLoggedIn = !!profile;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Dropdown Menu (Logged In)
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const avatarUrl = avatarData?.image || null;

  return (
    <Header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
      {/* Left: AI Tutor */}
      <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-black rounded-lg" />
        <span className="text-xl font-bold text-gray-900">AI Tutor</span>
      </Link>

      {/* Center: Dashboard Link */}
      {isLoggedIn && (
        <div className="flex-1 flex justify-center">
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors ${
              isActive('/dashboard')
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard
          </Link>
        </div>
      )}

      {/* Right: Auth Controls */}
      <div className="flex items-center">
        {isLoggedIn ? (
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <Button type="text" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
              <Avatar
                size={32}
                src={avatarUrl}
                icon={<UserOutlined />}
                className="border"
              />
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {profile?.first_name || 'User'}
              </span>
            </Button>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            size="middle"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        )}
      </div>
    </Header>
  );
}