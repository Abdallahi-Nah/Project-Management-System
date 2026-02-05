// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


import { FaUser, FaLock, FaEnvelope, FaGlobe } from "react-icons/fa";

const AuthPage = () => {
  const { t, i18n } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();


  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // تغيير اللغة والاتجاه
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        // تسجيل الدخول
        result = await login(formData.email, formData.password);
      } else {
        // إنشاء حساب جديد
        result = await register(
          formData.name,
          formData.email,
          formData.password
        );
      }

      if (result.success) {
        // يمكنك هنا التوجيه إلى لوحة التحكم (سنفعل ذلك لاحقاً)
        navigate('/dashboard');
      } else {
        alert(result.message); // عرض رسالة الخطأ من السيرفر
      }
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 overflow-hidden relative">
      {/* خلفية جمالية متحركة */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-yellow-300 opacity-10 rounded-full blur-3xl"
        />
      </div>

      {/* البطاقة الرئيسية (Glassmorphism) */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
      >
        {/* القسم الأيمن (الصورة/النص الترحيبي) */}
        <div className="hidden md:flex md:w-1/2 bg-black/20 items-center justify-center p-10 text-white text-center relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-4xl font-bold mb-4">
              {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
            </h1>
            <p className="text-lg opacity-80">
              {isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
            </p>
          </div>
        </div>

        {/* القسم الأيسر (النماذج) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/40">
          {/* مبدل اللغة */}
          <div className="flex justify-end mb-4">
            <div className="bg-white/50 rounded-lg p-1 flex gap-1">
              {["en", "ar", "fr"].map((lng) => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`p-2 rounded-md transition-all ${
                    i18n.language === lng
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  <FaGlobe size={18} />
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ x: i18n.dir() === "rtl" ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: i18n.dir() === "rtl" ? -50 : 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                {isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* حقل الاسم (يظهر فقط في التسجيل) */}
                {!isLogin && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder={t("auth.namePlaceholder")}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                )}

                {/* حقل البريد */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t("auth.emailPlaceholder")}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                {/* حقل كلمة المرور */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                {/* زر الإرسال */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70"
                >
                  {isLoading
                    ? t("auth.loading")
                    : isLogin
                    ? t("auth.loginBtn")
                    : t("auth.registerBtn")}
                </motion.button>
              </form>

              {/* زر التبديل */}
              <div className="mt-6 text-center">
                <span className="text-gray-600">
                  {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="mx-2 text-indigo-600 font-bold hover:underline focus:outline-none"
                >
                  {isLogin
                    ? t("auth.switchToRegister")
                    : t("auth.switchToLogin")}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
