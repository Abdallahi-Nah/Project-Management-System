// routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

// جميع هذه المسارات محمية (تحتاج تسجيل دخول)
router
  .route("/")
  .post(protect, createProject) // إنشاء مشروع
  .get(protect, getProjects); // عرض المشاريع

router
  .route("/:id")
  .get(protect, getProject)
  .put(protect, updateProject) // تحديث مشروع
  .delete(protect, deleteProject); // حذف مشروع

module.exports = router;
