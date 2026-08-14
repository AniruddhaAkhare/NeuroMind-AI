import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


// ============================================================
// LOGIN PAGE
// ============================================================

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


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };


  // ==========================================================
  // HANDLE LOGIN
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const email = formData.email.trim();
    const password = formData.password;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

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
      const response = await login(
        email,
        password
      );

      if (response?.success) {
        setSuccess("Login successful. Redirecting...");

        const redirectPath =
          location.state?.from?.pathname ||
          "/dashboard";

        setTimeout(() => {
          navigate(
            redirectPath,
            { replace: true }
          );
        }, 500);

      } else {
        setError(
          response?.error ||
          "Unable to sign in. Please try again."
        );
      }

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to connect to the server. Please make sure the Flask backend is running.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // DEMO LOGIN
  // ==========================================================

  const fillDemoAccount = () => {
    setFormData({
      email: "testuser@example.com",
      password: "TestPassword123",
    });

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns:
          "minmax(0, 1.05fr) minmax(420px, 0.95fr)",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 48%, #f8fafc 100%)",
        color: "#172033",
        overflow: "hidden",
      }}
    >

      {/* ==================================================
          LEFT BRAND / PRODUCT PANEL
      ================================================== */}

      <section
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 7vw 42px",
          background:
            "linear-gradient(145deg, #111827 0%, #172554 55%, #312e81 100%)",
          color: "#ffffff",
          overflow: "hidden",
        }}
      >

        {/* Decorative glow */}

        <div
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background:
              "rgba(99, 102, 241, 0.20)",
            filter: "blur(20px)",
            top: "-150px",
            right: "-120px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "rgba(59, 130, 246, 0.14)",
            filter: "blur(20px)",
            bottom: "-120px",
            left: "-100px",
          }}
        />


        {/* BRAND */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
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
                background:
                  "linear-gradient(135deg, #6366f1, #3b82f6)",
                boxShadow:
                  "0 10px 30px rgba(59,130,246,0.28)",
                fontSize: "21px",
                fontWeight: 800,
              }}
            >
              N
            </div>

            <div>

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  letterSpacing: "-0.3px",
                }}
              >
                NeuroScan AI
              </div>

              <div
                style={{
                  marginTop: "2px",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.58)",
                  letterSpacing: "0.9px",
                  textTransform: "uppercase",
                }}
              >
                MRI Intelligence Platform
              </div>

            </div>

          </div>

        </div>


        {/* HERO CONTENT */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "620px",
            margin: "70px 0",
          }}
        >

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              borderRadius: "999px",
              border:
                "1px solid rgba(255,255,255,0.14)",
              background:
                "rgba(255,255,255,0.06)",
              color: "#c7d2fe",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >

            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#34d399",
                boxShadow:
                  "0 0 12px rgba(52,211,153,0.8)",
              }}
            />

            AI MODEL ONLINE

          </div>


          <h1
            style={{
              margin: 0,
              fontSize:
                "clamp(38px, 4.5vw, 64px)",
              lineHeight: 1.04,
              letterSpacing: "-2.8px",
              fontWeight: 800,
            }}
          >
            Intelligent MRI
            <br />

            <span
              style={{
                background:
                  "linear-gradient(90deg, #a5b4fc, #60a5fa)",
                WebkitBackgroundClip:
                  "text",
                WebkitTextFillColor:
                  "transparent",
              }}
            >
              analysis, explained.
            </span>
          </h1>


          <p
            style={{
              marginTop: "25px",
              maxWidth: "540px",
              fontSize: "16px",
              lineHeight: 1.75,
              color:
                "rgba(255,255,255,0.68)",
            }}
          >
            Analyze brain MRI scans using your
            trained EfficientNet-B3 model and
            understand model predictions through
            Grad-CAM visual explanations.
          </p>


          {/* FEATURE CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "12px",
              marginTop: "38px",
            }}
          >

            {[
              {
                value: "4",
                label: "MRI Classes",
              },
              {
                value: "B3",
                label: "EfficientNet",
              },
              {
                value: "AI",
                label: "Grad-CAM",
              },
            ].map((item) => (

              <div
                key={item.label}
                style={{
                  padding: "16px",
                  borderRadius: "15px",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  background:
                    "rgba(255,255,255,0.055)",
                  backdropFilter:
                    "blur(12px)",
                }}
              >

                <div
                  style={{
                    fontSize: "21px",
                    fontWeight: 800,
                    color: "#ffffff",
                  }}
                >
                  {item.value}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    color:
                      "rgba(255,255,255,0.52)",
                  }}
                >
                  {item.label}
                </div>

              </div>

            ))}

          </div>

        </div>


        {/* DISCLAIMER */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "640px",
            paddingTop: "22px",
            borderTop:
              "1px solid rgba(255,255,255,0.10)",
          }}
        >

          <p
            style={{
              margin: 0,
              fontSize: "11px",
              lineHeight: 1.7,
              color:
                "rgba(255,255,255,0.45)",
            }}
          >
            Academic research and initial clinical
            decision-support system. Predictions
            must be validated by qualified
            healthcare professionals and must not
            be used as a standalone diagnosis.
          </p>

        </div>

      </section>


      {/* ==================================================
          LOGIN PANEL
      ================================================== */}

      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background:
            "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
        }}
      >

        <div
          style={{
            width: "100%",
            maxWidth: "440px",
          }}
        >

          {/* MOBILE BRAND */}

          <div
            style={{
              display: "none",
            }}
          >
            NeuroScan AI
          </div>


          {/* HEADING */}

          <div
            style={{
              marginBottom: "30px",
            }}
          >

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding:
                  "6px 10px",
                borderRadius: "8px",
                background:
                  "#eef2ff",
                color: "#4f46e5",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing:
                  "0.4px",
                textTransform:
                  "uppercase",
                marginBottom: "17px",
              }}
            >

              Secure Access

            </div>


            <h2
              style={{
                margin: 0,
                fontSize: "34px",
                lineHeight: 1.15,
                letterSpacing: "-1.3px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Welcome back.
            </h2>


            <p
              style={{
                margin:
                  "10px 0 0",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#64748b",
              }}
            >
              Sign in to continue to your MRI
              analysis workspace.
            </p>

          </div>


          {/* FORM CARD */}

          <div
            style={{
              padding: "30px",
              borderRadius: "22px",
              background: "#ffffff",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 20px 60px rgba(15,23,42,0.08)",
            }}
          >

            <form
              onSubmit={handleSubmit}
            >

              {/* ERROR */}

              {error && (

                <div
                  role="alert"
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems:
                      "flex-start",
                    padding: "12px 14px",
                    marginBottom: "20px",
                    borderRadius: "12px",
                    background: "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >

                  <span>!</span>

                  <span>
                    {error}
                  </span>

                </div>

              )}


              {/* SUCCESS */}

              {success && (

                <div
                  role="status"
                  style={{
                    padding: "12px 14px",
                    marginBottom: "20px",
                    borderRadius: "12px",
                    background: "#ecfdf5",
                    border:
                      "1px solid #a7f3d0",
                    color: "#047857",
                    fontSize: "13px",
                  }}
                >
                  {success}
                </div>

              )}


              {/* EMAIL */}

              <div
                style={{
                  marginBottom: "19px",
                }}
              >

                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 650,
                    color: "#1e293b",
                  }}
                >
                  Email address
                </label>


                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "48px",
                    boxSizing: "border-box",
                    padding:
                      "0 14px",
                    borderRadius: "12px",
                    border:
                      "1px solid #dbe1ea",
                    background: "#f8fafc",
                    color: "#0f172a",
                    outline: "none",
                    fontSize: "14px",
                    transition:
                      "all 0.2s ease",
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor =
                      "#6366f1";
                    event.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(99,102,241,0.10)";
                    event.currentTarget.style.background =
                      "#ffffff";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor =
                      "#dbe1ea";
                    event.currentTarget.style.boxShadow =
                      "none";
                    event.currentTarget.style.background =
                      "#f8fafc";
                  }}
                />

              </div>


              {/* PASSWORD */}

              <div
                style={{
                  marginBottom: "14px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom: "8px",
                  }}
                >

                  <label
                    htmlFor="password"
                    style={{
                      fontSize: "13px",
                      fontWeight: 650,
                      color: "#1e293b",
                    }}
                  >
                    Password
                  </label>

                </div>


                <div
                  style={{
                    position: "relative",
                  }}
                >

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: "100%",
                      height: "48px",
                      boxSizing:
                        "border-box",
                      padding:
                        "0 48px 0 14px",
                      borderRadius: "12px",
                      border:
                        "1px solid #dbe1ea",
                      background:
                        "#f8fafc",
                      color: "#0f172a",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={{
                      position:
                        "absolute",
                      right: "8px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: "34px",
                      height: "34px",
                      border: "none",
                      borderRadius: "8px",
                      background:
                        "transparent",
                      color: "#64748b",
                      cursor:
                        "pointer",
                      fontSize: "16px",
                    }}
                  >
                    {showPassword
                      ? "◉"
                      : "◌"}
                  </button>

                </div>

              </div>


              {/* REMEMBER / SECURITY */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin:
                    "16px 0 22px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >

                <span
                  style={{
                    display: "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    width: "18px",
                    height: "18px",
                    borderRadius: "6px",
                    background:
                      "#eef2ff",
                    color:
                      "#4f46e5",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </span>

                Secure JWT authenticated session

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "50px",
                  border: "none",
                  borderRadius: "12px",
                  background:
                    loading
                      ? "#818cf8"
                      : "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor:
                    loading
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    "0 10px 24px rgba(79,70,229,0.22)",
                  transition:
                    "all 0.2s ease",
                }}
              >

                {loading ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "9px",
                    }}
                  >

                    <span
                      style={{
                        width: "15px",
                        height: "15px",
                        border:
                          "2px solid rgba(255,255,255,0.35)",
                        borderTopColor:
                          "#ffffff",
                        borderRadius:
                          "50%",
                        animation:
                          "loginSpin 0.8s linear infinite",
                      }}
                    />

                    Signing in...

                  </span>
                ) : (
                  "Sign in to workspace"
                )}

              </button>

            </form>


            {/* DEMO ACCOUNT */}

            <button
              type="button"
              onClick={fillDemoAccount}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "12px",
                height: "44px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "11px",
                background:
                  "#ffffff",
                color: "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Use test account
            </button>


            {/* SIGNUP */}

            <div
              style={{
                textAlign: "center",
                marginTop: "25px",
                paddingTop: "22px",
                borderTop:
                  "1px solid #eef2f7",
                fontSize: "13px",
                color: "#64748b",
              }}
            >

              Don't have an account?{" "}

              <Link
                to="/signup"
                style={{
                  color: "#4f46e5",
                  fontWeight: 700,
                  textDecoration:
                    "none",
                }}
              >
                Create account
              </Link>

            </div>

          </div>


          {/* FOOTER */}

          <div
            style={{
              textAlign: "center",
              marginTop: "22px",
              fontSize: "10px",
              lineHeight: 1.6,
              color: "#94a3b8",
            }}
          >
            Protected access • Academic research system
            <br />
            Alzheimer's MRI Detection & Explainable AI
          </div>

        </div>

      </section>


      {/* ==================================================
          RESPONSIVE / ANIMATION CSS
      ================================================== */}

      <style>
        {`
          @keyframes loginSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {

            .login-left-panel {
              display: none;
            }

            .login-page {
              grid-template-columns: 1fr !important;
            }

          }

          @media (max-width: 600px) {

            .login-page-section {
              padding: 24px !important;
            }

          }
        `}
      </style>

    </div>
  );
}

export default Login;