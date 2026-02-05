const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "يرجى إدخال الاسم"],
    },
    email: {
      type: String,
      required: [true, "يرجى إدخال البريد الإلكتروني"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "يرجى إدخال كلمة المرور"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
