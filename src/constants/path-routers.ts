export interface PathItem {
  [k: string]: {
    PATH: string;
    LABEL: string;
    BREADCRUMB?: { title: string; href: string }[];
  };
}

export const LOGIN: PathItem = {
  DETAIL: { PATH: "/login", LABEL: "Đăng nhập" },
};

export const REGISTER: PathItem = {
  DETAIL: { PATH: "/register", LABEL: "Đăng ký" },
};

export const RESET_PASSWORD: PathItem = {
  DETAIL: { PATH: "/reset-password", LABEL: "Thay đổi mật khẩu" },
};

export const DASHBOARD: PathItem = {
  DETAIL: {
    PATH: "/",
    LABEL: "Trang chủ",
    BREADCRUMB: [{ title: "Dashboard", href: "/" }],
  },
};

export const LECTURERS: PathItem = {
  DETAIL: {
    PATH: "/lecturers",
    LABEL: "Giảng viên",
    BREADCRUMB: [{ title: "Giảng viên", href: "/lecturers" }],
  },
};

export const CATEGORIES: PathItem = {
  DETAIL: {
    PATH: "/categories",
    LABEL: "Danh mục",
    BREADCRUMB: [{ title: "Danh mục", href: "/categories" }],
  },
};

export const BLOGS: PathItem = {
  DETAIL: {
    PATH: "/blogs",
    LABEL: "Bài viết",
    BREADCRUMB: [{ title: "Bài viết", href: "/blogs" }],
  },
  CREATE: {
    PATH: "/blogs/create",
    LABEL: "Tạo bài viết",
    BREADCRUMB: [
      { title: "Bài viết", href: "/blogs" },
      { title: "Tạo mới", href: "/blogs/create" },
    ],
  },
  EDIT: {
    PATH: "/blogs/:id",
    LABEL: "Chỉnh sửa bài viết",
    BREADCRUMB: [
      { title: "Bài viết", href: "/blogs" },
      { title: "Chỉnh sửa", href: "" },
    ],
  },
};

export const USERS: PathItem = {
  DETAIL: {
    PATH: "/users",
    LABEL: "Tài khoản",
    BREADCRUMB: [{ title: "Tài khoản", href: "/users" }],
  },
};

export const PROFILE: PathItem = {
  DETAIL: {
    PATH: "/profile",
    LABEL: "Thông tin tài khoản",
    BREADCRUMB: [{ title: "Thông tin tài khoản", href: "/profile" }],
  },
  CHANGE_PASSWORD: {
    PATH: "/profile/change-password",
    LABEL: "Thay đổi mật khẩu",
    BREADCRUMB: [
      { title: "Thông tin tài khoản", href: "/profile" },
      { title: "Thay đổi mật khẩu", href: "/profile/change-password" },
    ],
  },
};

export * as Paths from "./path-routers";
