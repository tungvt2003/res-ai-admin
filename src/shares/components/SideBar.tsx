import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Layout, Menu, MenuProps, Dropdown, Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChalkboardTeacher, FaFile, FaHome, FaList, FaSearch, FaUser } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { ChevronLeft, ChevronRight, Globe, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

import { persistor, useAppDispatch } from "../stores";
import { clearTokens } from "../stores/authSlice";

const { Sider } = Layout;

interface CustomMenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  url?: string;
  children?: CustomMenuItem[];
}

const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const currentPath = location.pathname;

  const fullMenuItems: CustomMenuItem[] = [
    {
      key: "dashboard",
      label: t("sidebar.dashboard"),
      icon: <FaHome className="w-5 h-5" />,
      url: "/",
    },
    {
      key: "users",
      label: t("sidebar.users"),
      icon: <FaUser className="w-5 h-5" />,
      url: "/users",
    },
    {
      key: "lecturers",
      label: "Quản lý Giảng viên",
      icon: <FaChalkboardTeacher className="w-5 h-5" />,
      url: "/lecturers",
    },
    {
      key: "categories",
      label: "Quản lý Danh mục",
      icon: <FaList className="w-5 h-5" />,
      url: "/categories",
    },
    {
      key: "blogs",
      label: "Quản lý Bài viết",
      icon: <FaFile className="w-5 h-5" />,
      url: "/blogs",
    },
    {
      key: "keywords",
      label: "Quản lý Từ khóa",
      icon: <FaSearch className="w-5 h-5" />,
      url: "/keywords",
    },
    {
      key: "settings",
      label: "Cấu hình hệ thống",
      icon: <IoIosSettings className="w-5 h-5" />,
      url: "/settings",
    },
  ];

  useEffect(() => {
    const pathSegments = currentPath.split("/").filter(Boolean);
    const key = pathSegments.length > 0 ? pathSegments[0] : "dashboard";
    setSelectedKey([key]);
  }, [currentPath]);

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 1450);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);

  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      const target = fullMenuItems.find((item) => item.key === key);
      if (target?.url) navigate(target.url);
    },
    [navigate, fullMenuItems],
  );

  const transformedMenuItems = useMemo(() => {
    const transform = (items: CustomMenuItem[]): MenuProps["items"] =>
      items.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children ? transform(item.children) : undefined,
      })) as MenuProps["items"];
    return transform(fullMenuItems);
  }, [fullMenuItems]);

  const settingsItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogOut size={18} className="text-red-500" />,
      label: <span className="text-red-500">{t("sidebar.logout")}</span>,
      onClick: () => {
        dispatch(clearTokens());
        persistor.purge();
        navigate("/login");
      },
    },
  ];

  return (
    <>
      <Sider
        className="!bg-[#f5f6f9] fixed top-0 left-0 h-screen border-r border-gray-200 transition-all duration-300 flex flex-col"
        width={230}
        collapsed={isCollapsed}
        collapsedWidth={80}
      >
        {/* Nút toggle */}
        <div
          className="absolute -right-1 top-9 text-white p-1 bg-blue-400 rounded-full z-20 cursor-pointer hover:scale-125 transition-all duration-200"
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight size={16} color="white" />
          ) : (
            <ChevronLeft size={16} color="white" />
          )}
        </div>

        {/* Logo */}
        <div className="border-[0.5px] border-gray-200 bg-white rounded-lg drop-shadow-md shadow-gray-200 flex-1 flex flex-col h-full">
          <div className="drop-shadow-sm shadow-gray-200 sticky top-0 z-10 bg-white">
            <div className="flex flex-row items-center justify-center py-3 px-4 w-full relative">
              <img
                src={"/logo.jpg"}
                alt="Logo"
                className={`${
                  isCollapsed ? "translate-x-0" : "-translate-x-3"
                } w-10 h-10 rounded-full transition-all duration-200 cursor-pointer`}
                onClick={() => navigate("/")}
              />
              <div
                className={`ml-3 text-center font-semibold text-xl text-[#141414d1] transition-all duration-100 cursor-pointer ${
                  isCollapsed ? "opacity-0 absolute translate-x-10" : "opacity-100 translate-x-0"
                }`}
                onClick={() => navigate("/")}
              >
                Res AI
              </div>
            </div>
            <hr className="border-t border-[#8c8c8c48]" />
          </div>

          <Menu
            theme="light"
            defaultSelectedKeys={["dashboard"]}
            selectedKeys={selectedKey}
            mode="inline"
            inlineCollapsed={isCollapsed}
            items={transformedMenuItems}
            onClick={handleMenuClick}
            className="border-e-0 !p-2 flex-1"
          />

          <div className="p-2 flex justify-center mb-3">
            <Dropdown menu={{ items: settingsItems }} placement="topCenter" arrow>
              <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-all">
                <IoIosSettings className="w-5 h-5 text-gray-600" />
                {!isCollapsed && (
                  <span className="text-sm font-medium mt-1" onClick={(e) => e.stopPropagation()}>
                    {t("sidebar.settings")}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </div>
      </Sider>
    </>
  );
};

export default Sidebar;
