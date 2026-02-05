// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateProfile,
  updatePassword,
  getDashboardStats,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    تسجيل مستخدم جديد
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    تسجيل الدخول
// @access  Public
router.post("/login", loginUser);

router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.get("/stats", protect, getDashboardStats);
router.get("/me", protect, getMe);

module.exports = router;
