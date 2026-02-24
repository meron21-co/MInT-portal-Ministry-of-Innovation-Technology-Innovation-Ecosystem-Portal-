import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Per-field error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setSubmitError("");

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
      // Send only email & password
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user info
        localStorage.setItem("user", JSON.stringify(data.user));

        if (rememberMe) localStorage.setItem("rememberMe", "true");
        else localStorage.removeItem("rememberMe");

        // Redirect based on role returned by backend
        if (data.user.role === "inventor") navigate("/inventor");
        else if (data.user.role === "investor") navigate("/investor");
        else if (data.user.role === "admin") navigate("/AdminDashboard");
      } else {
        setSubmitError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back!</h2>
      <p>Please login to continue</p>

      <form onSubmit={handleLogin} noValidate>
        {submitError && <div className="error-message">{submitError}</div>}

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-describedby="password-error"
            aria-invalid={!!passwordError}
            required
          />
      
        </div>
        {passwordError && (
          <p id="password-error" className="field-error">
            {passwordError}
          </p>
        )}

        <div className="options-row">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>

          <a href="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
