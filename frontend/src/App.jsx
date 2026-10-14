import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Role-Based Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import RadiologistDashboard from "./pages/dashboards/RadiologistDashboard";
import PatientDashboard from "./pages/dashboards/PatientDashboard";

// Shared Protected Routes
import Analyze from "./pages/Analyze";
import Result from "./pages/Result";
import History from "./pages/History";
import About from "./pages/About";
import Hospitals from "./pages/Hospitals";
import RAGAssistant from "./pages/RAGAssistant";
import MedicalVault from "./pages/MedicalVault";

function RoleDashboardRedirect() {
  const { user } = useAuth();
  const role = (user?.role || "doctor").toLowerCase();

  switch (role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "radiologist":
    case "lab_technician":
      return <Navigate to="/radiologist/dashboard" replace />;
    case "patient":
      return <Navigate to="/patient/dashboard" replace />;
    case "receptionist":
      return <Navigate to="/hospitals" replace />;
    case "doctor":
    default:
      return <Navigate to="/doctor/dashboard" replace />;
  }
}

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast Notifications */}
        <Toaster position="top-right" />
        
        <Routes>
          {/* ==================================================
              PUBLIC ROUTES
          ================================================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ==================================================
              PROTECTED ROUTES
          ================================================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              {/* Dynamic Role Dashboard Routing */}
              <Route path="/dashboard" element={<RoleDashboardRedirect />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Specific Role Dashboards */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/radiologist/dashboard" element={<RadiologistDashboard />} />
              <Route path="/patient/dashboard" element={<PatientDashboard />} />

              {/* Shared Role Features */}
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/result/:id" element={<Result />} />
              <Route path="/result" element={<Result />} />
              <Route path="/history" element={<History />} />
              <Route path="/vault" element={<MedicalVault />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/assistant" element={<RAGAssistant />} />
              <Route path="/about" element={<About />} />
            </Route>
          </Route>

          {/* ==================================================
              FALLBACK
          ================================================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;