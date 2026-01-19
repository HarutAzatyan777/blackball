import React from "react";
import { Route, Navigate } from "react-router-dom";
import MenuPage from "./components/QrMenuPage";
import AdminPanelFirebase from "./components/AdminPanelFirebase";
import LoginForm from "./components/LoginForm";
import ConnectSupport from "./components/ConnectSupport";

const ADMIN_EMAILS = ["admin@blackball.am","dmin@king.am"];

export const getRoutes = (user) => [
  // <Route key="/" path="/" element={<MenuPage />} />,
  <Route key="/" path="/" element={<ConnectSupport />} />,
  <Route
    key="/admin"
    path="/admin"
    element={
      user && ADMIN_EMAILS.includes(user.email) ? (
        <AdminPanelFirebase />
      ) : (
        <LoginForm />
      )
    }
  />,
  <Route key="*" path="*" element={<Navigate to="/" />} />,
];
