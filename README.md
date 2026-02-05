# 🚀 Project Management System (MERN Stack)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Overview

A full-stack Project Management System (SaaS) built with modern MERN technologies. Enables users to create projects, manage tasks through an interactive Kanban board, with complete multi-language support (Arabic, English, French) and a responsive, beautiful user interface.

## ✨ Key Features

- 🎨 **Modern Design:** Attractive UI using Tailwind CSS & Framer Motion animations
- 🌍 **Multi-language Support:** Full support for Arabic, English, and French with RTL/LTR
- 📊 **Analytics Dashboard:** Charts using Recharts for project statistics
- 🎯 **Interactive Kanban Board:** Drag & Drop task management with smooth animations
- 🔐 **Robust Authentication:** Login, logout, profile management, and password change
- 📱 **Fully Responsive:** Works efficiently on all devices (desktop, tablet, mobile)

## 🛠️ Tech Stack

### Frontend:
- **React 19 & Vite**
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Recharts** (Charts)
- **React Router Dom** (Routing)
- **i18next** (Localization)
- **Axios** (HTTP Client)
- **React Beautiful DND** (via @hello-pangea/dnd)

### Backend:
- **Node.js & Express**
- **MongoDB & Mongoose**
- **JWT** (Authentication)
- **Bcrypt** (Password Hashing)
- **dotenv** (Environment Variables)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/project-management-system.git
cd project-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

Run backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:
```bash
npm run dev
```

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Kanban Board
![Kanban](./screenshots/tasks.png)

### Projects List
![Projects](./screenshots/projects.png)

### Mobile Responsive
![Mobile](./screenshots/projects-mobile.png)
![Mobile-2](./screenshots/sidebar-mobile.png)
![Mobile-3](./screenshots/tasks-mobile.png)
![Mobile-4](./screenshots/settings-mobile.png)

## 🌐 Live Demo

[Live Demo Link](https://project-management-system-onyc.vercel.app/)

## 👨‍💻 Author

**Abdallahi Nah**
- GitHub: [@Abdallahi-Nah](https://github.com/Abdallahi-Nah)
- LinkedIn: [My LinkedIn](https://linkedin.com/in/abdallahi-nah)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with dedication as part of my portfolio to showcase full-stack development skills.

---

⭐ If you found this project helpful, please give it a star!
