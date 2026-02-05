// src/utils/api.js
import axios from "axios";

// استخدام المتغير البيئي
const API_URL = import.meta.env.VITE_API_URL;

// إنشاء نسخة من axios مخصصة
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// (اختياري): إضافة اعتراض (Interceptor) لإرسال التوكن تلقائياً مع كل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
