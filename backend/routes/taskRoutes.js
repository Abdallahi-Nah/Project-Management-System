// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

// جميع هذه المسارات محمية
router
  .route("/")
  .post(protect, createTask) // إنشاء مهمة
  .get(protect, getTasks); // عرض المهام

router
  .route("/:id")
  .put(protect, updateTask) // تحديث مهمة
  .delete(protect, deleteTask); // حذف مهمة

module.exports = router;
