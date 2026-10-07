import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

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
            
            {/* Common Dashboard Routing Logic will handle redirecting 
                from /dashboard to specific role dashboards */}
            <Route path="/dashboard" element={<Navigate to="/doctor/dashboard" replace />} />
            
            {/* Specific Role Dashboards */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/radiologist/dashboard" element={<RadiologistDashboard />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />

            {/* Features */}
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/result" element={<Result />} />
            <Route path="/history" element={<History />} />
            <Route path="/vault" element={<MedicalVault />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/assistant" element={<RAGAssistant />} />
            <Route path="/about" element={<About />} />

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