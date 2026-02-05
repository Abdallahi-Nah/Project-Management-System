// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Layout from "./components/Layout";
import ProjectsPage from "./pages/ProjectsPage"; // استيراد الصفحة الجديدة
import KanbanBoard from "./pages/KanbanBoard";
import SettingsPage from "./pages/SettingsPage";
import DashboardPage from "./pages/DashboardPage";


function App() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      {/* المسارات المحمية */}
      <Route
        path="/dashboard"
        element={
          <Layout>
            <DashboardPage />
          </Layout>
        }
      />
      <Route
        path="/projects"
        element={
          <Layout>
            <ProjectsPage />
          </Layout>
        }
      />

      {/* مسار المهام (سنطوره الآن) */}
      <Route
        path="/tasks"
        element={
          <Layout>
            <KanbanBoard />
          </Layout>
        }
      />

      <Route
        path="/settings"
        element={
          <Layout>
            <SettingsPage />
          </Layout>
        }
      />

      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;
