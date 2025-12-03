import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./Navbar";
import React from "react";

const { Content } = Layout;

export default function ProtectedLayout() {
  return (
    <Layout style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Content style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
