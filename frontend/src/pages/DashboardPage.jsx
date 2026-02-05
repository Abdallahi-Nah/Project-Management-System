// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B"]; // Indigo, Emerald, Amber

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greetingType, setGreetingType] = useState(""); // سيحمل: morning, afternoon, evening

  // تحديد نوع الترحيب حسب الوقت
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingType("morning");
    else if (hour < 18) setGreetingType("afternoon");
    else setGreetingType("evening");
  }, []);

  // جلب البيانات من الباك اند
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/auth/stats");
        setStats(data.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // إعداد بيانات الرسم البياني مع الترجمة
  const chartData = stats
    ? [
        {
          name: t("dashboard.activeProjects"),
          value: stats.activeProjects,
          color: COLORS[0],
        },
        {
          name: t("dashboard.completedProjects"),
          value: stats.completedProjects,
          color: COLORS[1],
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-indigo-600 text-xl animate-pulse">
        Loading Magic...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <FaProjectDiagram size={200} />
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {t(`dashboard.${greetingType}`)}, {user?.name}!
        </h2>
        <p className="text-indigo-100 text-lg">{t("dashboard.welcomeMsg")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Projects */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium">
              {t("dashboard.totalProjects")}
            </p>
            <h3 className="text-4xl font-bold text-gray-800 mt-2">
              {stats?.totalProjects || 0}
            </h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl group-hover:scale-110 transition-transform">
            <FaProjectDiagram />
          </div>
        </motion.div>

        {/* Card 2: Active */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium">
              {t("dashboard.activeProjects")}
            </p>
            <h3 className="text-4xl font-bold text-gray-800 mt-2">
              {stats?.activeProjects || 0}
            </h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 text-2xl group-hover:scale-110 transition-transform">
            <FaClock />
          </div>
        </motion.div>

        {/* Card 3: Completed */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium">
              {t("dashboard.completedProjects")}
            </p>
            <h3 className="text-4xl font-bold text-gray-800 mt-2">
              {stats?.completedProjects || 0}
            </h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-2xl group-hover:scale-110 transition-transform">
            <FaCheckCircle />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            {t("dashboard.distribution")}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              {t("dashboard.recentProjects")}
            </h3>
            <button
              onClick={() => (window.location.href = "/projects")}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              {t("dashboard.viewAll")}
            </button>
          </div>

          <div className="space-y-4">
            {stats?.recentProjects.length > 0 ? (
              stats.recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                        project.status === "Active"
                          ? "bg-indigo-500"
                          : "bg-green-500"
                      }`}
                    >
                      <FaProjectDiagram size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {project.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      project.status === "Active"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                {t("dashboard.noProjects")}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
