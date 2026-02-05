// src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTasks } from "react-icons/fa";
import api from "../utils/api";

const ProjectsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // بيانات النموذج (للإنشاء والتعديل)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Active",
  });
  const [editId, setEditId] = useState(null);

  // 1. جلب المشاريع
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/projects?keyword=${search}`);
      setProjects(data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // تأخير بسيط للبحث لتجنب طلبات متعددة
    const timer = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. فتح النافذة (إضافة أو تعديل)
  const openModal = (project = null) => {
    if (project) {
      setFormData(project);
      setEditId(project._id);
    } else {
      setFormData({ title: "", description: "", status: "Active" });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // 3. حفظ المشروع (إنشاء أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, formData);
        alert(t("projects.projectUpdated"));
      } else {
        await api.post("/projects", formData);
        alert(t("projects.projectCreated"));
      }
      closeModal();
      fetchProjects();
    } catch (error) {
      alert("Error saving project");
    }
  };

  // 4. حذف المشروع
  const handleDelete = async (id) => {
    if (window.confirm(t("projects.deleteConfirm"))) {
      try {
        await api.delete(`/projects/${id}`);
        alert(t("projects.projectDeleted"));
        fetchProjects();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // التعامل مع تغيير المدخلات
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* الرأس: العنوان والبحث والإضافة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {t("projects.title")}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* البحث */}
          <div className="relative group">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
            <input
              type="text"
              placeholder={t("projects.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            />
          </div>

          {/* زر الإضافة */}
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <FaPlus />
            <span>{t("projects.newProject")}</span>
          </button>
        </div>
      </div>

      {/* شبكة المشاريع */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">{t("common.noData")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              {/* شريط ملون علوي */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  project.status === "Active" ? "bg-indigo-500" : "bg-green-500"
                }`}
              ></div>

              <div className="flex justify-between items-start mb-4 pl-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                    {project.title}
                  </h3>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full
                    ${
                      project.status === "Active"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {project.status === "Active"
                      ? t("projects.active")
                      : t("projects.completed")}
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-6 pl-3 line-clamp-2 h-10">
                {project.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between pl-3 mt-auto border-t border-gray-100 pt-4">
                <button
                  onClick={() => navigate(`/tasks?projectId=${project._id}`)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                >
                  <FaTasks /> {t("projects.viewTasks")}
                </button>

                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(project)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* النافذة المنبثقة (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {t("projects.modalTitle")}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("projects.labelTitle")}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("projects.labelDesc")}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("projects.labelStatus")}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Active">{t("projects.active")}</option>
                  <option value="Completed">{t("projects.completed")}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// نحتاج لاستيراد motion لتشغيل الأنيميشن في الـ Modal
import { motion } from "framer-motion";

export default ProjectsPage;
