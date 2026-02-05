// controllers/taskController.js
const Task = require("../models/Task");
const Project = require("../models/Project");

// @desc    إنشاء مهمة جديدة
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
    } = req.body;

    // التحقق من وجود المشروع
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "المشروع المحدد غير موجود" });
    }

    // التحقق من أن المستخدم هو صاحب المشروع
    if (project.createdBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({
          success: false,
          message: "غير مصرح لك بإضافة مهام لهذا المشروع",
        });
    }

    const task = await Task.create({
      title,
      description,
      status: status || "To Do",
      priority: priority || "Medium",
      dueDate,
      projectId,
      assignedTo: assignedTo || req.user.id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    جلب المهام (مع البحث والفلترة)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { keyword, projectId } = req.query;

    // بناء كائن البحث
    let query = { projectId: projectId }; // يجب تمرير projectId

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // جلب المهام مع تعبئة بيانات المستخدم المعين (assignedTo)
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email") 
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    تحديث مهمة (مهم جداً للسحب والإفلات Drag & Drop)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "المهمة غير موجودة" });
    }

    // التحقق من ملكية المشروع المرتبط بالمهمة
    const project = await Project.findById(task.projectId);
    if (project.createdBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "غير مصرح لك بتعديل هذه المهمة" });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    حذف مهمة
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "المهمة غير موجودة" });
    }

    // التحقق من ملكية المشروع
    const project = await Project.findById(task.projectId);
    if (project.createdBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "غير مصرح لك بحذف هذه المهمة" });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, message: "تم حذف المهمة بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
