import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, Stethoscope, Microscope, ShieldCheck, 
  Activity, Calendar, Check, Eye, EyeOff, Sparkles, AlertCircle 
} from "lucide-react";

const ROLES = [
  {
    id: "patient",
    label: "Patient & Family",
    icon: User,
    badge: "Personal Health",
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    description: "Access your brain scans, daily caregiver safety protocol, and schedule appointments."
  },
  {
    id: "doctor",
    label: "Attending Neurologist",
    icon: Stethoscope,
    badge: "Clinical Workstation",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    description: "Upload MRIs, inspect 4-class staging, review 6-pillar dossiers, and export PDF reports."
  },
  {
    id: "radiologist",
    label: "Neuroradiologist",
    icon: Microscope,
    badge: "PACS & Saliency",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    description: "Deep Grad-CAM saliency verification, WW/WL contrast sliders & asymmetry analysis."
  },
  {
    id: "admin",
    label: "System Administrator",
    icon: ShieldCheck,
    badge: "Governance",
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    description: "Infrastructure telemetry, real-time KPI metrics, and HIPAA compliance audit trail."
  },
  {
    id: "lab_technician",
    label: "Lab Technician",
    icon: Activity,
    badge: "Technical Lab",
    color: "#0284c7",
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
    description: "Ingest DICOM and NIfTI 3D neuroimaging series and calibrate voxel normalization."
  },
  {
    id: "receptionist",
    label: "Clinical Receptionist",
    icon: Calendar,
    badge: "Intake & Directory",
    color: "#4f46e5",
    bgColor: "#eef2ff",
    borderColor: "#c7d2fe",
    description: "Patient registration, clinic appointments, and hospital doctor affiliations."
  }
];

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    role: "patient",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const fullName = formData.full_name.trim();
    const email = formData.email.trim();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please create a password.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await signup(
        fullName,
        email,
        formData.password,
        formData.role,
        { phone: formData.phone.trim() }
      );

      if (response?.success) {
        const selectedRoleObj = ROLES.find((r) => r.id === formData.role);
        setSuccess(
          `Account created successfully! Launching your ${selectedRoleObj?.label || "user"} portal...`
        );

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 800);
        return;
      }

      setError(
        response?.error ||
        response?.message ||
        "Unable to create your account."
      );
    } catch (err) {
      console.error("Signup error:", err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to connect to the server. Please check that backend is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const currentRole = ROLES.find((r) => r.id === formData.role) || ROLES[0];

  return (
    <div
      className="signup-page"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(0, 0.95fr) minmax(480px, 1.25fr)",
        background: "#080c1a",
        color: "#e2e8f0",
      }}
    >
      {/* =====================================================
          LEFT BRANDING PANEL
      ===================================================== */}
      <section
        className="signup-left-panel"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 5vw 42px",
          background: "linear-gradient(160deg, #050814 0%, #0c1838 55%, #1e1b4b 100%)",
          color: "#fff",
          overflow: "hidden",
          borderRight: "1px solid rgba(6, 182, 212, 0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
            filter: "blur(30px)",
            top: "-150px",
            right: "-120px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            filter: "blur(30px)",
            bottom: "-100px",
            left: "-80px",
            pointerEvents: "none",
          }}
        />

        {/* BRAND LOGO */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              fontSize: "22px",
              fontWeight: 900,
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
            }}
          >
            🧠
          </div>
          <div>
            <div style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "1px" }}>
              NEUROVIA
            </div>
            <div
              style={{
                marginTop: "2px",
                fontSize: "10px",
                color: "#22d3ee",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              Role-Based Clinical AI Platform
            </div>
          </div>
        </div>

        {/* HERO COPY */}
        <div style={{ position: "relative", zIndex: 1, margin: "40px 0" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(6, 182, 212, 0.12)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              color: "#67e8f9",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "20px",
              fontFamily: "monospace",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22d3ee",
                boxShadow: "0 0 10px #22d3ee",
              }}
            />
            UNIFIED MULTI-ROLE ACCESS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(32px, 3.8vw, 52px)",
              lineHeight: 1.12,
              letterSpacing: "-1.5px",
              fontWeight: 800,
            }}
          >
            Create your
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #67e8f9, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              specialized workspace.
            </span>
          </h1>

          <p
            style={{
              marginTop: "20px",
              maxWidth: "480px",
              fontSize: "14px",
              lineHeight: 1.7,
              color: "rgba(226, 232, 240, 0.75)",
            }}
          >
            Register your verified clinical or patient profile to unlock tailor-made tools:
            from high-precision EfficientNet-B3 MRI classification to personal daily caregiver protocols.
          </p>

          {/* ACTIVE ROLE PREVIEW CARD */}
          <div
            style={{
              marginTop: "28px",
              padding: "18px 20px",
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.6)",
              border: `1px solid ${currentRole.borderColor}`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  background: currentRole.bgColor,
                  color: currentRole.color,
                  letterSpacing: "0.5px",
                }}
              >
                {currentRole.badge}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>
                {currentRole.label}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
              {currentRole.description}
            </p>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.6, color: "rgba(255,255,255,0.4)" }}>
            Academic research & clinical decision support platform. Protected by JWT authorization and encrypted SQLite/PostgreSQL storage.
          </p>
        </div>
      </section>

      {/* =====================================================
          RIGHT FORM PANEL
      ===================================================== */}
      <section
        className="signup-form-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 32px",
          background: "#080c1a",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "560px" }}>
          {/* HEADER */}
          <div style={{ marginBottom: "22px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "8px",
                background: "rgba(6, 182, 212, 0.1)",
                color: "#22d3ee",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: "monospace",
                marginBottom: "10px",
              }}
            >
              <Sparkles style={{ width: "12px", height: "12px" }} />
              Registration Portal
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "28px",
                lineHeight: 1.2,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.8px",
              }}
            >
              Create Your Clinical Profile
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Select your role to configure your dedicated tools and feature access.
            </p>
          </div>

          {/* MAIN CARD */}
          <div
            style={{
              padding: "26px",
              borderRadius: "20px",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* ERROR ALERT */}
              {error && (
                <div
                  style={{
                    padding: "12px 14px",
                    marginBottom: "18px",
                    borderRadius: "12px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* SUCCESS ALERT */}
              {success && (
                <div
                  style={{
                    padding: "12px 14px",
                    marginBottom: "18px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#6ee7b7",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Check style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                  <span>{success}</span>
                </div>
              )}

              {/* ROLE SELECTION GRID */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "monospace",
                  }}
                >
                  Select Your Healthcare Role:
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "9px",
                  }}
                >
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isSelected = formData.role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r.id)}
                        disabled={loading}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "12px",
                          border: isSelected
                            ? `2px solid ${r.color}`
                            : "1px solid rgba(255,255,255,0.08)",
                          background: isSelected
                            ? "rgba(30, 41, 59, 0.95)"
                            : "rgba(15, 23, 42, 0.5)",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          boxShadow: isSelected
                            ? `0 0 16px ${r.color}33`
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            padding: "6px",
                            borderRadius: "8px",
                            background: isSelected ? r.color : "rgba(255,255,255,0.05)",
                            color: isSelected ? "#fff" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon style={{ width: "15px", height: "15px" }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: isSelected ? 800 : 600,
                              color: isSelected ? "#fff" : "#cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>{r.label}</span>
                            {isSelected && (
                              <Check
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  color: r.color,
                                }}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: isSelected ? "#94a3b8" : "#64748b",
                              marginTop: "2px",
                              lineHeight: 1.3,
                            }}
                          >
                            {r.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FULL NAME */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="full_name"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                  }}
                >
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Dr. Marcus Vance or Arthur Pendelton"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "44px",
                    boxSizing: "border-box",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(15, 23, 42, 0.8)",
                    outline: "none",
                    fontSize: "13px",
                    color: "#f8fafc",
                  }}
                />
              </div>

              {/* EMAIL */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                  }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "44px",
                    boxSizing: "border-box",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(15, 23, 42, 0.8)",
                    outline: "none",
                    fontSize: "13px",
                    color: "#f8fafc",
                  }}
                />
              </div>

              {/* PHONE (OPTIONAL) */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="phone"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                  }}
                >
                  Phone number <span style={{ color: "#64748b", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 019-2831"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "44px",
                    boxSizing: "border-box",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(15, 23, 42, 0.8)",
                    outline: "none",
                    fontSize: "13px",
                    color: "#f8fafc",
                  }}
                />
              </div>

              {/* PASSWORDS (GRID) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#cbd5e1",
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min 8 chars"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        width: "100%",
                        height: "44px",
                        boxSizing: "border-box",
                        padding: "0 38px 0 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(15, 23, 42, 0.8)",
                        outline: "none",
                        fontSize: "13px",
                        color: "#f8fafc",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirm_password"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#cbd5e1",
                    }}
                  >
                    Confirm password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        width: "100%",
                        height: "44px",
                        boxSizing: "border-box",
                        padding: "0 38px 0 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(15, 23, 42, 0.8)",
                        outline: "none",
                        fontSize: "13px",
                        color: "#f8fafc",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "48px",
                  border: "none",
                  borderRadius: "12px",
                  background: loading
                    ? "#334155"
                    : "linear-gradient(135deg, #06b6d4, #2563eb)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 10px 25px rgba(6, 182, 212, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                {loading
                  ? "Configuring Profile..."
                  : `Create Account as ${currentRole.label}`}
              </button>
            </form>

            {/* SIGN IN LINK */}
            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "13px",
                color: "#94a3b8",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#38bdf8",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Sign in here
              </Link>
            </div>
          </div>

          {/* FOOTER NOTE */}
          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            NEUROVIA Clinical AI • EfficientNet-B3 • HIPAA Compliant Audit System
          </div>
        </div>
      </section>

      {/* RESPONSIVE CSS */}
      <style>
        {`
          @media (max-width: 960px) {
            .signup-page {
              grid-template-columns: 1fr !important;
            }
            .signup-left-panel {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Signup;