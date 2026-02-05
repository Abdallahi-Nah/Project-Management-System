// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Project = require("../models/Project");

// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. التحقق من وجود المستخدم مسبقاً
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل" });
    }

    // 2. تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. إنشاء المستخدم
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "member", // الافتراضي member
    });

    // 4. إنشاء التوكن (JWT)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. التحقق من إدخال البيانات
    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        });
    }

    // 2. البحث عن المستخدم وتضمين كلمة المرور للمقارنة
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    // 3. مقارنة كلمة المرور المشفرة
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    // 4. إنشاء التوكن
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    تحديث البيانات الشخصية
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // البحث عن المستخدم
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    // تحديث الحقول
    user.name = name || user.name;
    user.email = email || user.email;

    // حفظ التعديلات
    await user.save();

    // إرجاع التوكن الجديد (أو القديم) والبيانات الجديدة
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      success: true,
      data: { user: { _id: user._id, name: user.name, email: user.email }, token }
    });
  } catch (error) {
    // التعامل مع خطأ تكرار البريد الإلكتروني
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    تغيير كلمة المرور
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة المرور الحالية والجديدة' });
    }

    const user = await User.findById(req.user.id).select('+password');

    // التحقق من كلمة المرور الحالية
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    جلب إحصائيات لوحة التحكم
// @route   GET /api/auth/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. عدد المشاريع الكلي
    const totalProjects = await Project.countDocuments({ createdBy: userId });

    // 2. عدد المشاريع النشطة والمكتملة
    const activeProjects = await Project.countDocuments({ createdBy: userId, status: 'Active' });
    const completedProjects = await Project.countDocuments({ createdBy: userId, status: 'Completed' });

    // 3. جلب آخر 3 مشاريع
    const recentProjects = await Project.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        recentProjects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    جلب بيانات المستخدم الحالي (من أنا؟)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user يتم تعبئته تلقائياً بواسطة middleware 'protect'
    const user = req.user; 
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  updatePassword,
  getDashboardStats,
  getMe,
};