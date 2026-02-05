// src/pages/KanbanBoard.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FaPlus,
  FaTrash,
  FaUser,
  FaTimes,
  FaEdit,
  FaProjectDiagram,
} from "react-icons/fa";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const KanbanBoard = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.search);

  // ✅ State لإدارة المشروع المحدد (بدلاً من الاعتماد على الرابط فقط)
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [allProjects, setAllProjects] = useState([]); // لملء القائمة المنسدلة

  const [tasks, setTasks] = useState([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // حالة النافذة المنبثقة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });
  const [editingId, setEditingId] = useState(null);

  // 1. جلب جميع مشاريع المستخدم (للقائمة المنسدلة)
  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setAllProjects(data.data);
    } catch (error) {
      console.error("Error fetching projects list", error);
    }
  };

  // 2. جلب المهام بناءً على المشروع المحدد
  const fetchTasks = async (projectIdParam = null) => {
    try {
      setLoading(true);
      // إذا تم تمرير projectId، استخدمه، وإلا استخدم الحالة الحالية
      const idToFetch = projectIdParam || selectedProjectId;

      // بناء الطلب
      const url = idToFetch ? `/tasks?projectId=${idToFetch}` : "/tasks";

      const tasksRes = await api.get(url);
      setTasks(tasksRes.data.data);

      // تحديث عنوان المشروع (للعرض فقط)
      if (idToFetch) {
        const currentProject = allProjects.find((p) => p._id === idToFetch);
        setProjectTitle(currentProject ? currentProject.title : "");
      } else {
        setProjectTitle(t("tasks.title")); // عنوان عام
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. جلب قائمة المشاريع
    fetchProjects();

    // 2. التحقق من الرابط (إذا جاء المستخدم من صفحة المشاريع)
    const urlProjectId = searchParams.get("projectId");
    if (urlProjectId) {
      setSelectedProjectId(urlProjectId);
    } else {
      // الوضع الافتراضي: العرض الكامل (قيمة فارغة تعني "الكل")
      setSelectedProjectId("");
    }
  }, []); // يحدث مرة واحدة عند التحميل

  // 3. مراقبة تغيير المشروع المحدد لجلب المهام (يحل مشكلة التنقل)
  useEffect(() => {
    if (allProjects.length > 0) {
      fetchTasks();
    }
  }, [selectedProjectId, allProjects]); // يعيد التحميل عند تغيير المشروع

  const columns = {
    todo: tasks.filter((t) => t.status === "To Do"),
    inprogress: tasks.filter((t) => t.status === "In Progress"),
    done: tasks.filter((t) => t.status === "Done"),
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    let newStatus = "";
    if (destination.droppableId === "todo") newStatus = "To Do";
    else if (destination.droppableId === "inprogress")
      newStatus = "In Progress";
    else if (destination.droppableId === "done") newStatus = "Done";

    const updatedTasks = tasks.map((task) => {
      if (task._id === draggableId) return { ...task, status: newStatus };
      return task;
    });
    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch (error) {
      console.error("Update failed", error);
      fetchTasks();
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setTaskFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
      setEditingId(task._id);
    } else {
      setTaskFormData({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;
    // التأكد من وجود مشروع محدد للإضافة
    if (!selectedProjectId) {
      alert("Please select a project first!");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, {
          title: taskFormData.title,
          description: taskFormData.description,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate,
        });
        alert("Task Updated Successfully!");
      } else {
        await api.post("/tasks", {
          title: taskFormData.title,
          description: taskFormData.description,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate,
          projectId: selectedProjectId,
          status: "To Do",
          assignedTo: user?._id,
        });
        alert("Task Created Successfully!");
      }
      closeModal();
      fetchTasks();
    } catch (error) {
      alert("Operation Failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{projectTitle}</h1>
          <p className="text-sm text-gray-500">{t("tasks.title")}</p>
        </div>

        {/* ✅ القائمة المنسدلة لاختيار المشروع */}
        <div className="flex gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
          >
            <option value="">{t("common.viewAll") || "All Projects"}</option>
            {allProjects.map((proj) => (
              <option key={proj._id} value={proj._id}>
                {proj.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => openModal()}
            disabled={!selectedProjectId}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <FaPlus />
            <span>{t("tasks.addTask")}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-4 h-full overflow-x-auto pb-4">
            <Column
              id="todo"
              title={t("tasks.todo")}
              tasks={columns.todo}
              color="bg-gray-200"
              handleDelete={handleDelete}
              handleEdit={openModal}
              t={t}
              dir={i18n.dir()}
            />
            <Column
              id="inprogress"
              title={t("tasks.inProgress")}
              tasks={columns.inprogress}
              color="bg-indigo-100"
              handleDelete={handleDelete}
              handleEdit={openModal}
              t={t}
              dir={i18n.dir()}
            />
            <Column
              id="done"
              title={t("tasks.done")}
              tasks={columns.done}
              color="bg-green-100"
              handleDelete={handleDelete}
              handleEdit={openModal}
              t={t}
              dir={i18n.dir()}
            />
          </div>
        </DragDropContext>
      )}

      {/* Modal (نفس الكود السابق) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId
                  ? t("taskModal.updateTask")
                  : t("taskModal.addNewTask")}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Inputs... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("taskModal.titleLabel")}
                </label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("taskModal.descriptionLabel")}
                </label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("taskModal.priorityLabel")}
                  </label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Low">{t("taskModal.low")}</option>
                    <option value="Medium">{t("taskModal.medium")}</option>
                    <option value="High">{t("taskModal.high")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("taskModal.dueDateLabel")}
                  </label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  {editingId
                    ? t("taskModal.updateBtn")
                    : t("taskModal.createBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// (باقي كود المكون Column كما هو في المرة السابقة)
const Column = ({
  id,
  title,
  tasks,
  color,
  handleDelete,
  handleEdit,
  t,
  dir,
}) => (
  <div
    className={`flex-1 min-w-[300px] ${color} rounded-2xl p-4 flex flex-col h-full`}
  >
    <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
      {title}
      <span className="bg-white/50 px-2 py-1 rounded-md text-xs">
        {tasks.length}
      </span>
    </h3>
    <Droppable droppableId={id} direction="vertical" isDropDisabled={false}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex-1 space-y-3 overflow-y-auto"
          style={{ minHeight: "100px" }}
        >
          {tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-white/50 relative group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-600"
                          : task.priority === "Medium"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t(`tasks.${task.priority.toLowerCase()}`)}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mb-2">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <div className="flex items-center gap-1">
                      <FaUser size={10} />
                      <span>
                        {task.assignedTo ? task.assignedTo.name : "Unassigned"}
                      </span>
                    </div>
                    {task.dueDate && (
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

export default KanbanBoard;
