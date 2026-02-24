import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load dashboard data");

        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      <p>Approve projects, manage users, and oversee the ecosystem.</p>

      <h3>📋 Pending Projects</h3>
      <ul>
        {dashboardData?.projects?.map((project) => (
          <li key={project._id}>
            {project.name} - {project.status}
            <button onClick={() => approveProject(project._id)}>Approve</button>
          </li>
        ))}
      </ul>

      <h3>👥 Users</h3>
      <ul>
        {dashboardData?.users?.map((user) => (
          <li key={user._id}>{user.email} ({user.role})</li>
        ))}
      </ul>
    </div>
  );
}

async function approveProject(id) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/admin/projects/${id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to approve project");

    alert("✅ Project approved!");
    window.location.reload(); // Refresh dashboard
  } catch (err) {
    alert("❌ " + err.message);
  }
}

export default AdminDashboard;
