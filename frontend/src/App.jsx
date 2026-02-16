import { Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import useAuth from "./hooks/useAuth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import JobAnalytics from "./pages/JobAnalytics";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      {/* 🔥 Premium SaaS Background Wrapper */}
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white font-sans antialiased selection:bg-indigo-500/30">

        {/* Soft Glow Background Effect */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full"></div>
        </div>

        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-analytics/:jobId"
            element={
              <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                <JobAnalytics />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
