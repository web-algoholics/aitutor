import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./Navbar";
import Footer from "./Footer";
import React from "react";

const { Content } = Layout;

export default function PublicLayout() {
  return (
    <Layout style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Content style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
}




