import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Layout, Spin } from "antd";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useGetCurrentUserQuery } from "../services/authApi";

const { Content } = Layout;

export default function ProtectedLayout() {
  const location = useLocation();
  const { data: user, isFetching, isError } = useGetCurrentUserQuery(undefined);

  // Пока грузим информацию о пользователе — показываем спиннер
  if (isFetching) {
    return (
      <Layout style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </Layout>
    );
  }

  // Если запрос упал (401 и т.п.) или пользователя нет — отправляем на логин
  if (!user || isError) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Content style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </Content>
      <Footer/>
    </Layout>
  );
}
