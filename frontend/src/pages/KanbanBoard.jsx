// src/pages/KanbanBoard.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaPlus, FaTrash, FaUser, FaTimes, FaEdit } from "react-icons/fa";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const KanbanBoard = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get("projectId");

  const [tasks, setTasks] = useState([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // حالة النافذة المنبثقة
  const [isModalOpen, setIsModalOpen] = useState(false);

  // حالة البيانات (للإضافة أو التعديل)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  // لتتبع ما إذا كنا نعدل مهمة أم نضيف جديدة
  const [editingId, setEditingId] = useState(null);

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [tasksRes, projectRes] = await Promise.all([
        api.get(`/tasks?projectId=${projectId}`),
        api.get(`/projects/${projectId}`),
      ]);

      setTasks(tasksRes.data.data);
      setProjectTitle(projectRes.data.data.title);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

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
    ) {
      return;
    }

    let newStatus = "";
    if (destination.droppableId === "todo") newStatus = "To Do";
    else if (destination.droppableId === "inprogress")
      newStatus = "In Progress";
    else if (destination.droppableId === "done") newStatus = "Done";

    const updatedTasks = tasks.map((task) => {
      if (task._id === draggableId) {
        return { ...task, status: newStatus };
      }
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

  // فتح النافذة (للإضافة أو التعديل)
  const openModal = (task = null) => {
    if (task) {
      // وضع التعديل
      setTaskFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
      setEditingId(task._id);
    } else {
      // وضع الإضافة
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
    setTaskFormData({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
    });
  };

  // حفظ المهمة (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    try {
      if (editingId) {
        // ✅ تحديث المهمة
        await api.put(`/tasks/${editingId}`, {
          title: taskFormData.title,
          description: taskFormData.description,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate,
          // لا نرسل status أو assignedTo لعدم تغييرها بالخطأ
        });
        alert("Task Updated Successfully!");
      } else {
        // ✅ إضافة مهمة جديدة
        await api.post("/tasks", {
          title: taskFormData.title,
          description: taskFormData.description,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate,
          projectId,
          status: "To Do",
          // الـ Backend سيتكفل بتعيينها للمستخدم
        });
        alert("Task Created Successfully!");
      }

      closeModal();
      fetchTasks();
    } catch (error) {
      console.error("Error:", error);
      alert("Operation Failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    }
  };

  if (!projectId) {
    return (
      <div className="p-10 text-center text-red-500">Error: No Project ID.</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{projectTitle}</h1>
          <p className="text-sm text-gray-500">{t("tasks.title")}</p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <FaPlus />
          <span>{t("tasks.addTask")}</span>
        </button>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Update Task" : "Add New Task"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
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
                  Description
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
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
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
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
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
                  {editingId ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// تحديث مكون العمود لاستقبال handleEdit وإضافة زر التعديل
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
                    {/* أزرار التحكم تظهر عند التحويم */}
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
