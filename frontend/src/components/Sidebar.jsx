// src/components/Sidebar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaHome,
  FaProjectDiagram,
  FaTasks,
  FaCog,
  FaSignOutAlt,
  FaGlobe,
} from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    // سيتم ربطها بـ AuthContext لاحقاً
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuItems = [
    { path: "/dashboard", icon: FaHome, label: t("menu.dashboard") },
    { path: "/projects", icon: FaProjectDiagram, label: t("menu.projects") },
    { path: "/tasks", icon: FaTasks, label: t("menu.tasks") },
    { path: "/settings", icon: FaCog, label: t("menu.settings") },
  ];

  return (
    <>
      {/* خلفية غامقة للموبايل (Overlay) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* القائمة الجانبية */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${i18n.dir() === "rtl" ? "right-0 left-auto" : "left-0 right-auto"}
          ${
            isOpen
              ? "translate-x-0"
              : i18n.dir() === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
          }
          md:translate-x-0 md:static md:shadow-none
        `}
      >
        <div className="flex flex-col h-full border-r border-gray-100">
          {/* الشعار والعنوان */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-600">
              {t("menu.sidebarTitle")}
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* الروابط */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // إغلاق القائمة في الموبايل عند الضغط
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* التذييل (تبديل اللغة + خروج) */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            {/* تبديل اللغة */}
            <div className="flex justify-center gap-2 mb-4">
              {["en", "ar", "fr"].map((lng) => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${
                      i18n.language === lng
                        ? "bg-indigo-600 text-white shadow-md scale-110"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }
                  `}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium"
            >
              <FaSignOutAlt />
              <span>{t("menu.logout")}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
