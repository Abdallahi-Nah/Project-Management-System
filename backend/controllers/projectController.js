// controllers/projectController.js
const Project = require("../models/Project");

// @desc    إنشاء مشروع جديد
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    // ملاحظة: قيمة req.user.id ستأتي من Middleware المصادقة (auth.js) الذي سنكتبه لاحقاً
    const { title, description, status, dueDate } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      dueDate,
      createdBy: req.user.id, // ربط المشروع بالمستخدم الحالي
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    جلب جميع مشاريع المستخدم (مع البحث)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: "i", // 'i' تعني عدم الحساسية لحالة الأحرف (كبيرة أو صغيرة)
          },
        }
      : {};

    // البحث عن المشاريع التابعة للمستخدم فقط والمطابقة للكلمة المفتاحية
    const projects = await Project.find({
      ...keyword,
      createdBy: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    جلب مشروع واحد
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    تحديث مشروع
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "المشروع غير موجود" });
    }

    // التأكد من أن المستخدم هو صاحب المشروع
    if (project.createdBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "غير مصرح لك بتعديل هذا المشروع" });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    حذف مشروع
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "المشروع غير موجود" });
    }

    // التأكد من أن المستخدم هو صاحب المشروع
    if (project.createdBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "غير مصرح لك بحذف هذا المشروع" });
    }

    await project.deleteOne(); // أو project.remove() في الإصدارات القديمة

    res.status(200).json({ success: true, message: "تم حذف المشروع بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
