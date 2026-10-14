import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Brain, Stethoscope, Microscope, User, ShieldCheck, 
  Eye, EyeOff, ArrowRight, Check, AlertCircle, Sparkles 
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "doctor",
    title: "Neurologist",
    email: "doctor@neuromind.ai",
    password: "Password123!",
    icon: Stethoscope,
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.3)",
    tag: "Workstation & MRI Staging"
  },
  {
    role: "radiologist",
    title: "Radiologist",
    email: "radiologist@neuromind.ai",
    password: "Password123!",
    icon: Microscope,
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.12)",
    border: "rgba(168, 85, 247, 0.3)",
    tag: "Grad-CAM & Saliency PACS"
  },
  {
    role: "patient",
    title: "Patient & Family",
    email: "patient@neuromind.ai",
    password: "Password123!",
    icon: User,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.3)",
    tag: "Health Portal & Protocols"
  },
  {
    role: "admin",
    title: "System Admin",
    email: "admin@neuromind.ai",
    password: "Password123!",
    icon: ShieldCheck,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.3)",
    tag: "Telemetry & Governance"
  }
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeDemo, setActiveDemo] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    if (error) setError("");
  };

  const fillDemoAccount = (demo) => {
    setActiveDemo(demo.role);
    setFormData({
      email: demo.email,
      password: demo.password,
    });
    setError("");
    setSuccess(`Loaded ${demo.title} credentials`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);

      if (response?.success) {
        setSuccess("Login successful. Initializing role workstation...");
        const redirectPath = location.state?.from?.pathname || "/dashboard";

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      } else {
        setError(response?.error || "Unable to sign in. Please verify your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to connect to the server. Please verify backend is running on port 5000.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(440px, 0.95fr)",
        background: "#080c1a",
        color: "#e2e8f0",
      }}
    >
      {/* ==================================================
          LEFT HERO PANEL
      ================================================== */}
      <section
        className="login-left-panel"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 6vw 42px",
          background: "linear-gradient(160deg, #050814 0%, #0c1838 55%, #1e1b4b 100%)",
          color: "#ffffff",
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
            filter: "blur(40px)",
            top: "-150px",
            right: "-120px",
            pointerEvents: "none",
          }}
        />

        {/* LOGO */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
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
              Clinical AI Diagnostics
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1, margin: "50px 0" }}>
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
            NEURO-ONCOLOGY & DEMENTIA INTELLIGENCE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 4vw, 56px)",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              fontWeight: 800,
            }}
          >
            Welcome to the
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #67e8f9, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              diagnostic portal.
            </span>
          </h1>

          <p
            style={{
              marginTop: "22px",
              maxWidth: "480px",
              fontSize: "14px",
              lineHeight: 1.7,
              color: "rgba(226, 232, 240, 0.75)",
            }}
          >
            Sign in to access your role-specific dashboard. Attending Neurologists,
            Neuroradiologists, Patients & Families, and Administrators all receive
            dedicated clinical tooling and data protection.
          </p>

          {/* QUICK DEMO ROLE SELECTOR */}
          <div style={{ marginTop: "32px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#94a3b8",
                marginBottom: "12px",
                fontFamily: "monospace",
              }}
            >
              ⚡ Quick 1-Click Role Login:
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {DEMO_ACCOUNTS.map((d) => {
                const Icon = d.icon;
                const isActive = activeDemo === d.role;
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => fillDemoAccount(d)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      background: isActive ? d.bg : "rgba(15, 23, 42, 0.6)",
                      border: `1px solid ${isActive ? d.color : d.border}`,
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      boxShadow: isActive ? `0 0 15px ${d.color}40` : "none",
                    }}
                  >
                    <div
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        background: d.bg,
                        color: d.color,
                        display: "flex",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc" }}>
                        {d.title}
                      </div>
                      <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                        {d.tag}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM METRICS */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            gap: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#22d3ee" }}>99.2%</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Validation Sensitivity</div>
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#818cf8" }}>&lt;165ms</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>EfficientNet Latency</div>
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#34d399" }}>43,000+</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Trained Axial Scans</div>
          </div>
        </div>
      </section>

      {/* ==================================================
          RIGHT LOGIN FORM
      ================================================== */}
      <section
        className="login-form-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          background: "#080c1a",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {/* HEADER */}
          <div style={{ marginBottom: "26px" }}>
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
                marginBottom: "12px",
              }}
            >
              <Sparkles style={{ width: "12px", height: "12px" }} />
              Secure Authentication
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: 1.15,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.8px",
              }}
            >
              Sign In to NEUROVIA
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Enter your verified email or select a role profile to begin.
            </p>
          </div>

          {/* CARD */}
          <div
            style={{
              padding: "28px",
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

              {/* EMAIL */}
              <div style={{ marginBottom: "16px" }}>
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
                  placeholder="doctor@neuromind.ai"
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

              {/* PASSWORD */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label
                    htmlFor="password"
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#cbd5e1",
                    }}
                  >
                    Password
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Demo: Password123!
                  </span>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: "100%",
                      height: "44px",
                      boxSizing: "border-box",
                      padding: "0 40px 0 14px",
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
                      right: "10px",
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <>
                    <span>Sign In to Workstation</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* CREATE ACCOUNT LINK */}
            <div
              style={{
                textAlign: "center",
                marginTop: "22px",
                paddingTop: "18px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "13px",
                color: "#94a3b8",
              }}
            >
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                style={{
                  color: "#38bdf8",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Create a role profile
              </Link>
            </div>
          </div>

          {/* BACK TO HOME */}
          <div style={{ textAlign: "center", marginTop: "18px" }}>
            <Link
              to="/"
              style={{
                fontSize: "12px",
                color: "#64748b",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ← Back to Public Overview
            </Link>
          </div>
        </div>
      </section>

      {/* RESPONSIVE CSS */}
      <style>
        {`
          @media (max-width: 960px) {
            .login-page {
              grid-template-columns: 1fr !important;
            }
            .login-left-panel {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Login;