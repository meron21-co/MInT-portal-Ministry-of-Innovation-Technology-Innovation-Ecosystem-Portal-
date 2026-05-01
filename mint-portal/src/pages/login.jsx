import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { AuthContext } from "./AuthContext";
import { useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use context for global state

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setSubmitError("");

        // 🔒 CHECK LOCK
    const now = Date.now();
const secondsLeft = Math.ceil((lockUntil - now) / 1000);




    let valid = true;
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

     const data = await res.json();

    



              if (res.ok) {
                setAttempts(prev => 0);
                setLockUntil(0);
            // Update global auth state
            login(data.user, data.token, rememberMe);

            // SAVE ONLY ON SUCCESS
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            switch (data.user.role) {
              case "admin":
                navigate("/admin");
                break;
              case "inventor":
                navigate("/inventor");
                break;
              case "investor":
                navigate("/investor");
                break;
              default:
                setSubmitError("Unknown user role. Contact support.");
                break;
            }
          }
      
      else {
        // ❌ FAILED LOGIN → increase attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
        setLockUntil(Date.now() + 30 * 1000);
        setSubmitError("Too many failed attempts. Lock started...");
          setAttempts(0);
        } else {
          setSubmitError(data.message || "Login failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setSubmitError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (!lockUntil) return;

  const interval = setInterval(() => {
    const diff = Math.ceil((lockUntil - Date.now()) / 1000);

    if (diff <= 0) {
      setLockUntil(0);
      setTimeLeft(0);
    } else {
      setTimeLeft(diff);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [lockUntil]);
  

  if (lockUntil && Date.now() < lockUntil) {
  setSubmitError(`Please wait ${timeLeft} seconds`);
  return;
}


return (
  <div className="auth-container">
    <h2>Welcome Back!</h2>
    <p>Please login to continue</p>
        
    <form onSubmit={handleLogin} noValidate>
      {submitError && <div className="error-message">{submitError}</div>}
      {timeLeft > 0 && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          Please wait: {timeLeft} seconds
        </p>
      )}

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          // ❌ block ` " '
          const cleaned = e.target.value.replace(/[`"'']/g, "");
          setEmail(cleaned);
        }}
        autoComplete="username"
        aria-describedby="email-error"
        aria-invalid={!!emailError}
        required
      />
      {emailError && (
        <p id="email-error" className="field-error">
          {emailError}
        </p>
      )}

      <label htmlFor="password">Password</label>
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => {
            // ❌ block ` " '
            const cleaned = e.target.value.replace(/[`"'']/g, "");
            setPassword(cleaned);
          }}
          autoComplete="current-password"
          aria-describedby="password-error"
          aria-invalid={!!passwordError}
          required
        />
      </div>
        {passwordError && <p id="password-error" className="field-error">{passwordError}</p>}

        <div className="options-row">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>

          <button type="button" className="forgot-password-link" onClick={() => navigate("/forgot-password")}>

          Forgot Password?
        </button>
        </div>

        <button type="submit" className="auth-btn" disabled={loading || timeLeft > 0}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
