// src/components/Navbar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100 h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* زر القائمة للموبايل */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaBars size={24} />
        </button>
        {/* العنوان (يظهر فقط في الموبايل لأن الـ Sidebar مفتوح في الديسكتوب) */}
        <h2 className="md:hidden text-lg font-bold text-gray-800">
          {t("menu.dashboard")}
        </h2>
        <div className="hidden md:block"></div>{" "}
        {/* مكان محجوز للمحافظة على التمركز الأوسط */}
        {/* أيقونات المستخدم */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <FaBell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "Member"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold border-2 border-white shadow-sm">
              {user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <FaUserCircle />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
