import { Navigate, Route, Routes } from "react-router-dom";
import history from ".";
import { HistoryRouter } from "./history-router";
import MainLayout from "../layouts/MainLayout";
import { Paths } from "../constants/path-routers";
import LoginPage from "../pages/auth";
import RegisterPage from "../pages/auth/register";
import UserPage from "../pages/users";

import DashboardPage from "../pages/dashboard";
import AuthLayout from "../pages/auth/authLayout";
import Forbidden403 from "../shares/components/Forbidden403";
import React from "react";
import LecturerPage from "../pages/lecturer";
import CategoryPage from "../pages/blog";
import BlogPage from "../pages/category";

export const Navigator = () => {
  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route path={Paths.LOGIN.DETAIL.PATH} element={<LoginPage />} />
        <Route path={Paths.REGISTER.DETAIL.PATH} element={<RegisterPage />} />
        {/*  <Route
          path={Paths.RESET_PASSWORD.DETAIL.PATH}
          element={<ResetPasswordPage />}
        /> */}
        <Route element={<AuthLayout />}>
          <Route element={<MainLayout />}>
            <Route path={Paths.DASHBOARD.DETAIL.PATH} element={<DashboardPage />} />
            <Route path={Paths.USERS.DETAIL.PATH} element={<UserPage />} />
            <Route path={Paths.LECTURERS.DETAIL.PATH} element={<LecturerPage />} />
            <Route path={Paths.CATEGORIES.DETAIL.PATH} element={<CategoryPage />} />
            <Route path={Paths.BLOGS.DETAIL.PATH} element={<BlogPage />} />
          </Route>
        </Route>
        <Route path="/403" element={<Forbidden403 />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HistoryRouter>
  );
};
