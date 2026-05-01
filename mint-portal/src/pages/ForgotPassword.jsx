import React, { useState } from "react";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  if (!/\S+@\S+\.\S+/.test(email)) {
    setMessage("Please enter a valid email");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    await res.json();

    // Always same message (security)
    setMessage("If this email exists, a reset link has been sent 📧");
    setEmail("");

  } catch (err) {
    console.error(err);
    setMessage("Server error. Try again later.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;