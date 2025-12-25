import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Button, Drawer } from "antd";
import { UserOutlined, ArrowRightOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery, useLogoutMutation, authApi } from "../services/authApi";
import { useGetAvatarQuery } from "../services/profileApi";
import Logo from "./Logo";

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { data: user, isError } = useGetCurrentUserQuery(undefined, {});
  const { data: avatarData } = useGetAvatarQuery(undefined, { skip: !user });
  const [logout] = useLogoutMutation(undefined);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const avatarUrl = avatarData?.image || null;

  const isActive = (path: string) => {
    if (path === '/theory') {
      return location.pathname.startsWith('/theory');
    }
    if (path === '/quizzes') {
      return location.pathname.startsWith('/quizzes');
    }
    if (path === '/anki') {
      return location.pathname.startsWith('/anki');
    }
    if (path === '/market-analysis') {
      return location.pathname.startsWith('/market-analysis');
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } finally {
      dispatch(authApi.util.resetApiState());
      navigate("/");
    }
  };

  const navLinks = [
    { to: "/theory", label: "AI Курсы" },
    { to: "/quizzes", label: "Квизы" },
    { to: "/anki", label: "Anki" },
    { to: "/market-analysis", label: "Анализ вакансий" },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="flex items-center px-8 h-16 sticky top-0 z-50 bg-background border-b border-border">
      {/* Left: Logo + Mobile Menu Button */}
      <div className="flex items-center gap-4" style={{ flex: '1 1 0' }}>
        <Logo />
        
        {/* Mobile Menu Button - справа от логотипа */}
        {!isError && user && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px' }} />}
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
          />
        )}
      </div>

      {/* Desktop Links - Center */}
      {!isError && user && (
        <nav className="hidden md:flex gap-6 font-medium justify-center" style={{ flex: '1 1 0' }}>
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link 
                key={link.to} 
                to={link.to} 
                className="transition-all duration-300 flex items-center justify-center gap-2 relative"
                style={{ color: 'hsl(var(--primary))', transition: 'color 0.3s ease', fontSize: '16px' }}
              >
                <span 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    backgroundColor: '#000', 
                    borderRadius: '50%',
                    display: 'inline-block',
                    opacity: active ? 1 : 0,
                    transform: active ? 'scale(1)' : 'scale(0)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    visibility: active ? 'visible' : 'hidden',
                    minWidth: '6px'
                  }} 
                />
                <span style={{ transition: 'transform 0.3s ease', textAlign: 'center' }}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Right: Auth */}
      <div className="flex items-center gap-4 justify-end" style={{ flex: '1 1 0' }}>
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

            {/* Desktop Logout Button */}
            <Button 
              type="default" 
              onClick={handleLogout} 
              size="middle" 
              className="hidden md:inline-flex"
              className="bg-primary text-primary-foreground border-primary"
            >
              Выйти
            </Button>
          </>
        ) : (
          <Button 
            type="primary"
            style={{ backgroundColor: '#2B5797', borderColor: '#2B5797', color: '#fff' }}
          >
            <Link to="/login">
              Войти
              <ArrowRightOutlined className="ml-2" />
            </Link>
          </Button>
        )}
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        size={280}
        closeIcon={<CloseOutlined style={{ fontSize: '18px' }} />}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Nav Links */}
          <nav className="flex flex-col py-4">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleNavClick}
                  className="px-6 py-4 font-medium transition-all duration-300 flex items-center justify-center gap-3"
                  style={{ 
                    transition: 'background-color 0.3s ease, color 0.3s ease', 
                    color: 'hsl(var(--primary))',
                    backgroundColor: 'transparent',
                    fontSize: '18px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span 
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#000', 
                      borderRadius: '50%',
                      display: 'inline-block',
                      opacity: active ? 1 : 0,
                      transform: active ? 'scale(1)' : 'scale(0)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      visibility: active ? 'visible' : 'hidden',
                      minWidth: '8px'
                    }} 
                  />
                  <span style={{ transition: 'transform 0.3s ease', textAlign: 'center', flex: 1 }}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </Drawer>
    </header>
  );
}
