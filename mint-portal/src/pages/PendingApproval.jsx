import React from "react";

function PendingApproval() {
  const status = localStorage.getItem("approvalStatus");
  const message = localStorage.getItem("pendingMessage");

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif",
      background: "#f5f5f5"
    }}>
      <div style={{
        background: "white", borderRadius: "12px", padding: "2.5rem",
        maxWidth: "460px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.08)"
      }}>
        {status === "rejected" ? (
          <>
            <div style={{ fontSize: "3rem" }}>❌</div>
            <h2 style={{ color: "#c0392b" }}>Account Rejected</h2>
            <p style={{ color: "#555" }}>{message}</p>
            <p>Please contact support or register with a different account.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "3rem" }}>⏳</div>
            <h2 style={{ color: "#e67e22" }}>Awaiting Approval</h2>
            <p style={{ color: "#555" }}>
              Your account is pending review by an admin.
              You'll be able to log in once approved.
            </p>
          </>
        )}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          style={{
            marginTop: "1.5rem", padding: "10px 24px", borderRadius: "8px",
            border: "none", background: "#2563eb", color: "white",
            cursor: "pointer", fontSize: "14px"
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default PendingApproval;