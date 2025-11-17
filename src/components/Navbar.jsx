import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetCurrentUserQuery, useLogoutMutation } from "../services/authApi";
import { useGetAvatarQuery } from "../services/profileApi";

export default function Navbar() {
  const { data: user } = useGetCurrentUserQuery();
  const { data: avatarData } = useGetAvatarQuery(undefined, { skip: !user });
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const avatarUrl = avatarData?.image || null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-6 h-16">
      {/* Logo */}
      <div className=" font-bold text-xl">
        <Link to="/dashboard" className="hover:text-gray-500">MyApp</Link>
      </div>

      {/* Middle Links */}
      <nav className="hidden md:flex gap-6 text-sm font-medium text-black">
        <Link to="/dashboard" className="hover:text-gray-600 transition-colors">
          Dashboard
        </Link>
        <Link to="/roadmap" className="hover:text-gray-600 transition-colors">
          Roadmap
        </Link>
      </nav>

      {/* Right: Auth */}
      <div className="flex items-center gap-4">
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
            <Link to="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}