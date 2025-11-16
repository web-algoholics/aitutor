import { Link, useNavigate } from "react-router-dom";
import { Layout, Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetCurrentUserQuery, useLogoutMutation } from "../services/authApi";
import { useGetAvatarQuery } from "../services/profileApi"; 
import React from "react";

const { Header } = Layout;

export default function Navbar() {
  const { data: user } = useGetCurrentUserQuery();
  const { data: avatarData } = useGetAvatarQuery(undefined, {
    skip: !user,
  });

  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  // Avatar is returned as: { image: "data:image..." }
  const avatarUrl = avatarData?.image || null;

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderBottom: "1px solid #eee",
      }}
    >
      {/* Left: Logo */}
      <div style={{ fontWeight: 700, fontSize: 20 }}>
        <Link to="/dashboard">MyApp</Link>
      </div>

      {/* Middle: Links */}
      <div style={{ display: "flex", gap: 20 }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/roadmap">Roadmap</Link>
      </div>

      {/* Right: Avatar or Sign In */}
      <div>
        {user ? (
          <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
            
            {/* Avatar – link to profile */}
            <Link to="/profile">
              <Avatar
                src={avatarUrl}
                icon={<UserOutlined />}
                style={{ cursor: "pointer" }}
              />
            </Link>

            <Button
              type="default"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button type="primary">
            <Link to="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </Header>
  );
}
