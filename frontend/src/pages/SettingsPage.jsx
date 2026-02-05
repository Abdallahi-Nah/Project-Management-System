// src/pages/SettingsPage.jsx
import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { FaUser, FaLock, FaSave, FaArrowRight } from "react-icons/fa";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);

  // حالة بيانات الملف الشخصي
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // حالة كلمة المرور
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");

  // تحديث الملف الشخصي
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/profile", profileData);
      setUser(data.data.user); // تحديث بيانات المستخدم في الـ Context
      alert(t("settings.profileUpdated"));
    } catch (error) {
      alert(error.response?.data?.message || "Error updating profile");
    }
  };

  // تحديث كلمة المرور
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/password", passwordData);
      alert(data.message || t("settings.passwordChanged"));
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Error changing password");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* قسم العنوان والصورة */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-md">
          {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
        </div>
        <div className="text-center md:text-right flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            {t("settings.activeAccount")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* بطاقة 1: المعلومات الشخصية */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FaUser size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {t("settings.profileInfo")}
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.fullName")}
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.email")}
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-md"
            >
              <FaSave /> {t("settings.saveChanges")}
            </button>
          </form>
        </div>

        {/* بطاقة 2: الأمان (تغيير كلمة المرور) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <FaLock size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {t("settings.security")}
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.currentPassword")}
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.newPassword")}
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg transition-all shadow-md"
            >
              <FaArrowRight /> {t("settings.updatePassword")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
