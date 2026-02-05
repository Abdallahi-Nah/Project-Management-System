// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// @desc    حماية المسارات (التحقق من التوكن)
const protect = async (req, res, next) => {
  let token;

  // 1. التحقق من وجود التوكن في الهيدر (Header)
  // يجب أن يكون بصيغة: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. استخراج التوكن من الهيدر (بعد مسافة Bearer)
      token = req.headers.authorization.split(" ")[1];

      // 3. فك تشفير التوكن للتحقق من صحته
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. جلب بيانات المستخدم المرتبط بهذا التوكن ووضعها في req.user
      // .select('-password') لاستبعاد كلمة المرور من البيانات المرسلة
      req.user = await User.findById(decoded.id).select("-password");

      next(); // الانتقال للمتحكم (Controller) التالي
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ success: false, message: "غير مصرح، التوكن غير صالح" });
    }
  }

  // إذا لم يتم إرسال توكن
  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "غير مصرح، لم يتم تقديم توكن" });
  }
};

module.exports = { protect };
