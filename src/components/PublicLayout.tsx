import React from "react";
import { Outlet } from "react-router-dom";

// Публичный лэйаут без навигации. Страницы сами управляют своим оформлением.
export default function PublicLayout() {
  return <Outlet />;
}
