import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
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

    if (
      formData.password !==
      formData.confirm_password
    ) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await signup(
        fullName,
        email,
        formData.password
      );

      if (response?.success) {
        setSuccess(
          "Account created successfully. Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 900);

        return;
      }

      setError(
        response?.error ||
        response?.message ||
        "Unable to create your account."
      );

    } catch (err) {
      console.error(
        "Signup error:",
        err
      );

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to connect to the server.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="signup-page"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns:
          "minmax(0, 1.05fr) minmax(420px, 0.95fr)",
        background:
          "linear-gradient(135deg, #f8fafc, #eef2ff, #f8fafc)",
        color: "#172033",
      }}
    >

      {/* =====================================================
          LEFT PANEL
      ===================================================== */}

      <section
        className="signup-left-panel"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 7vw 42px",
          background:
            "linear-gradient(145deg, #111827, #172554 55%, #312e81)",
          color: "#fff",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            position: "absolute",
            width: "430px",
            height: "430px",
            borderRadius: "50%",
            background:
              "rgba(99,102,241,0.18)",
            filter: "blur(20px)",
            top: "-160px",
            right: "-130px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "rgba(59,130,246,0.13)",
            filter: "blur(20px)",
            bottom: "-130px",
            left: "-100px",
          }}
        />

        {/* BRAND */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
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
                "linear-gradient(135deg,#6366f1,#3b82f6)",
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
              }}
            >
              NeuroScan AI
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "11px",
                color:
                  "rgba(255,255,255,0.58)",
                letterSpacing: "0.9px",
                textTransform: "uppercase",
              }}
            >
              MRI Intelligence Platform
            </div>
          </div>

        </div>


        {/* CONTENT */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "610px",
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
              background:
                "rgba(255,255,255,0.06)",
              border:
                "1px solid rgba(255,255,255,0.12)",
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
              }}
            />

            RESEARCH WORKSPACE
          </div>


          <h1
            style={{
              margin: 0,
              fontSize:
                "clamp(38px,4.5vw,64px)",
              lineHeight: 1.04,
              letterSpacing: "-2.8px",
              fontWeight: 800,
            }}
          >
            Start your
            <br />

            <span
              style={{
                background:
                  "linear-gradient(90deg,#a5b4fc,#60a5fa)",
                WebkitBackgroundClip:
                  "text",
                WebkitTextFillColor:
                  "transparent",
              }}
            >
              AI workspace.
            </span>
          </h1>


          <p
            style={{
              marginTop: "25px",
              maxWidth: "530px",
              fontSize: "16px",
              lineHeight: 1.75,
              color:
                "rgba(255,255,255,0.68)",
            }}
          >
            Create your secure account and access
            MRI analysis, AI predictions, historical
            reports and Grad-CAM explanations from
            one workspace.
          </p>


          {/* WORKFLOW */}

          <div
            style={{
              marginTop: "35px",
              display: "flex",
              flexDirection: "column",
              gap: "13px",
            }}
          >

            {[
              "Upload brain MRI scans",
              "Run EfficientNet-B3 prediction",
              "Review explainable AI results",
            ].map((text, index) => (

              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "13px",
                  color:
                    "rgba(255,255,255,0.72)",
                }}
              >

                <span
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "rgba(99,102,241,0.25)",
                    color: "#c7d2fe",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </span>

                {text}

              </div>

            ))}

          </div>

        </div>


        {/* DISCLAIMER */}

        <div
          style={{
            position: "relative",
            zIndex: 1,
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
            decision-support system. AI predictions
            require validation by qualified healthcare
            professionals.
          </p>

        </div>

      </section>


      {/* =====================================================
          SIGNUP PANEL
      ===================================================== */}

      <section
        className="signup-form-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background:
            "rgba(255,255,255,0.76)",
          backdropFilter: "blur(20px)",
        }}
      >

        <div
          style={{
            width: "100%",
            maxWidth: "440px",
          }}
        >

          {/* HEADER */}

          <div
            style={{
              marginBottom: "28px",
            }}
          >

            <div
              style={{
                display: "inline-flex",
                padding: "6px 10px",
                borderRadius: "8px",
                background: "#eef2ff",
                color: "#4f46e5",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                marginBottom: "17px",
              }}
            >
              Create Account
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
              Create your account.
            </h2>


            <p
              style={{
                margin: "10px 0 0",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#64748b",
              }}
            >
              Set up your secure NeuroScan AI
              workspace in a few steps.
            </p>

          </div>


          {/* CARD */}

          <div
            style={{
              padding: "30px",
              borderRadius: "22px",
              background: "#fff",
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
                  style={{
                    padding: "12px 14px",
                    marginBottom: "18px",
                    borderRadius: "12px",
                    background: "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>

              )}


              {/* SUCCESS */}

              {success && (

                <div
                  style={{
                    padding: "12px 14px",
                    marginBottom: "18px",
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


              {/* FULL NAME */}

              <div
                style={{
                  marginBottom: "17px",
                }}
              >

                <label
                  htmlFor="full_name"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 650,
                    color: "#1e293b",
                  }}
                >
                  Full name
                </label>

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "48px",
                    boxSizing: "border-box",
                    padding: "0 14px",
                    borderRadius: "12px",
                    border:
                      "1px solid #dbe1ea",
                    background: "#f8fafc",
                    outline: "none",
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                />

              </div>


              {/* EMAIL */}

              <div
                style={{
                  marginBottom: "17px",
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
                    padding: "0 14px",
                    borderRadius: "12px",
                    border:
                      "1px solid #dbe1ea",
                    background: "#f8fafc",
                    outline: "none",
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                />

              </div>


              {/* PASSWORD */}

              <div
                style={{
                  marginBottom: "17px",
                }}
              >

                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 650,
                    color: "#1e293b",
                  }}
                >
                  Password
                </label>


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
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: "100%",
                      height: "48px",
                      boxSizing: "border-box",
                      padding:
                        "0 48px 0 14px",
                      borderRadius: "12px",
                      border:
                        "1px solid #dbe1ea",
                      background: "#f8fafc",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background:
                        "transparent",
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword
                      ? "◉"
                      : "◌"}
                  </button>

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div
                style={{
                  marginBottom: "21px",
                }}
              >

                <label
                  htmlFor="confirm_password"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 650,
                    color: "#1e293b",
                  }}
                >
                  Confirm password
                </label>


                <div
                  style={{
                    position: "relative",
                  }}
                >

                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={
                      formData.confirm_password
                    }
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: "100%",
                      height: "48px",
                      boxSizing: "border-box",
                      padding:
                        "0 48px 0 14px",
                      borderRadius: "12px",
                      border:
                        "1px solid #dbe1ea",
                      background: "#f8fafc",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background:
                        "transparent",
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword
                      ? "◉"
                      : "◌"}
                  </button>

                </div>

              </div>


              {/* PASSWORD INFO */}

              <div
                style={{
                  display: "flex",
                  gap: "9px",
                  alignItems:
                    "flex-start",
                  marginBottom: "21px",
                  padding: "11px 12px",
                  borderRadius: "11px",
                  background: "#f8fafc",
                  border:
                    "1px solid #eef2f7",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  color: "#64748b",
                }}
              >

                <span
                  style={{
                    color: "#6366f1",
                    fontWeight: 800,
                  }}
                >
                  i
                </span>

                Use at least 8 characters for
                your password.

              </div>


              {/* BUTTON */}

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
                      : "linear-gradient(135deg,#4f46e5,#6366f1)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor:
                    loading
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    "0 10px 24px rgba(79,70,229,0.22)",
                }}
              >

                {loading
                  ? "Creating account..."
                  : "Create secure account"}

              </button>

            </form>


            {/* LOGIN */}

            <div
              style={{
                textAlign: "center",
                marginTop: "23px",
                paddingTop: "21px",
                borderTop:
                  "1px solid #eef2f7",
                fontSize: "13px",
                color: "#64748b",
              }}
            >

              Already have an account?{" "}

              <Link
                to="/login"
                style={{
                  color: "#4f46e5",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>

            </div>

          </div>


          {/* FOOTER */}

          <div
            style={{
              textAlign: "center",
              marginTop: "21px",
              fontSize: "10px",
              lineHeight: 1.6,
              color: "#94a3b8",
            }}
          >
            Protected JWT authentication •
            NeuroScan AI
            <br />
            Alzheimer's MRI Detection &
            Explainable AI
          </div>

        </div>

      </section>


      {/* RESPONSIVE */}

      <style>
        {`
          @media (max-width: 900px) {
            .signup-page {
              grid-template-columns: 1fr !important;
            }

            .signup-left-panel {
              display: none !important;
            }
          }

          @media (max-width: 600px) {
            .signup-form-section {
              padding: 24px !important;
            }
          }
        `}
      </style>

    </div>
  );
}

export default Signup;