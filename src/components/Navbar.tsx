import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button } from "antd";
import { UserOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery, useLogoutMutation, authApi } from "../services/authApi";
import { useGetAvatarQuery } from "../services/profileApi";
import Logo from "./Logo";

export default function Navbar() {
  const dispatch = useDispatch();
  const { data: user, isError } = useGetCurrentUserQuery(undefined, {});
  const { data: avatarData } = useGetAvatarQuery(undefined, { skip: !user });
  const [logout] = useLogoutMutation(undefined);
  const navigate = useNavigate();

  const avatarUrl = avatarData?.image || null;

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } finally {
      // Мгновенно очищаем кеш, чтобы UI сразу понял, что пользователь вышел
      dispatch(authApi.util.resetApiState());
      navigate("/");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-8 h-16 sticky top-0 z-50">
      {/* Logo */}
      <Logo />

      {/* Middle Links */}
      {
        !isError && user && (
          <nav className="hidden md:flex gap-6 text-sm font-medium text-black">
            <Link to="/theory" className="text-black hover:text-gray-600 transition-colors">
              AI Курсы
            </Link>
            <Link to="/quizzes" className="text-black hover:text-gray-600 transition-colors">
              Квизы
            </Link>
            <Link to="/anki" className="text-black hover:text-gray-600 transition-colors">
              Anki
            </Link>
            <Link to="/market-analysis" className="text-black hover:text-gray-600 transition-colors">
              Market analysis
            </Link>
          </nav>
        )
      }
      

      {/* Right: Auth */}
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Avatar → Profile */}
            <Link to="/profile">
              <Avatar
                src={avatarUrl}
                icon={<UserOutlined />}
                className="cursor-pointer border border-gray-300 hover:border-gray-400 transition-colors"
                size={36}
              />
            </Link>

            {/* Logout Button */}
            <Button type="default" onClick={handleLogout} size="middle">
              Logout
            </Button>
          </>
        ) : (
          <Button type="primary">
            <Link to="/login">
              Sign In
              <ArrowRightOutlined className="ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
