import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,AreaChart, Area,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import Swal from "sweetalert2";
import "./Dashboard.css";


function AdminDashboard() {
  const [inventors, setInventors] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0 });

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "", role: "inventor",
    project: "", skills: "", experience: "", company: "", budget: "",
  });





const roleBarData = [
  {
    name: "Inventors",
    approved: inventors.filter(u => u.approvalStatus === "approved").length,
    rejected: inventors.filter(u => u.approvalStatus === "rejected").length,
    pending: inventors.filter(u => u.approvalStatus === "pending").length,
  },
  {
    name: "Investors",
    approved: investors.filter(u => u.approvalStatus === "approved").length,
    rejected: investors.filter(u => u.approvalStatus === "rejected").length,
    pending: investors.filter(u => u.approvalStatus === "pending").length,
  },
];


const getMonthlyPaymentData = () => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const data = months.map(m => ({
    name: m,
    paid: 0,
    needed: 0,
  }));

  // ✅ 1. Needed (from projects)
  projects.forEach((project) => {
    const date = new Date(project.createdAt);
    const monthIndex = date.getMonth();

    data[monthIndex].needed += Number(project.price || 0);
  });

  // ✅ 2. Paid (MATCH project month, NOT payment month)
  payments.forEach((payment) => {
    (payment.projects || []).forEach((proj) => {
      const project = projects.find(p => p._id === (proj.projectId?._id || proj.projectId));

      if (project) {
        const date = new Date(project.createdAt);
        const monthIndex = date.getMonth();

        data[monthIndex].paid += Number(proj.amount || 0);
      }
    });
  });

  return data;
};




  const token = localStorage.getItem("token");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [payments, setPayments] = useState([]);

  // ----------------- Safe Fetch -----------------
  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch (err) { throw new Error(`Invalid JSON from ${url}: ${text}`); }
      if (!res.ok) throw new Error(data.message || `HTTP error ${res.status}`);
      return data;
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      return null;
    }
  };

  // ----------------- Fetches -----------------
  const fetchInventors = async () => {
    const data = await safeFetch("http://localhost:5000/api/users/inventors", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data || [];
  };

  const fetchInvestors = async () => {
    const data = await safeFetch("http://localhost:5000/api/users/investors", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data || [];
  };

  const fetchProjects = async () => {
    const data = await safeFetch("http://localhost:5000/api/projects", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return Array.isArray(data) ? data : [];
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setPayments([]); return []; }
      const data = await res.json();
      setPayments(data || []);
      return data || [];
    } catch (err) {
      console.error("Fetch payments error:", err);
      setPayments([]);
      return [];
    }
  };

  // ✅ NEW: Fetch pending users
  const fetchPendingUsers = async () => {
    const data = await safeFetch("http://localhost:5000/api/users/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingUsers(data || []);
  };

  const fetchAllData = async () => {
    try {
      const [inventorsData, investorsData, projectsData, paymentsData] = await Promise.all([
        fetchInventors(), fetchInvestors(), fetchProjects(), fetchPayments(),
      ]);
      setInventors(inventorsData);
      setInvestors(investorsData);
      setProjects(projectsData);
      setPayments(paymentsData || []);

      const approved = projectsData.filter((p) => p.status === "Approved").length;
      const rejected = projectsData.filter((p) => p.status === "Rejected").length;
      const pending = projectsData.filter((p) => !p.status || p.status === "Pending").length;
      const totalRevenue = projectsData.filter((p) => p.status === "Approved")
        .reduce((sum, p) => sum + Number(p.price || 0), 0);
      const approvalRate = projectsData.length > 0 ? (approved / projectsData.length) * 100 : 0;

      setStats({
        totalUsers: inventorsData.length + investorsData.length,
        totalProjects: projectsData.length,
        approvedProjects: approved,
        rejectedProjects: rejected,
        pendingProjects: pending,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        approvalRate: Number(approvalRate.toFixed(1)),
      });
    } catch (err) {
      console.error("Error fetching all data:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchPendingUsers(); 
     const interval = setInterval(() => {
    fetchAllData(); // refresh every 5 sec
  }, 5000);

  return () => clearInterval(interval);
  }, []);



  // ✅ NEW: Handle approve or reject a user
  const handleUserApproval = async (userId, status, reason = "") => {
  const data = await safeFetch(`http://localhost:5000/api/users/${userId}/approval`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reason }),
  });

  if (!data) return;

  Swal.fire({
    icon: "success",
    title: status === "approved" ? "User Approved ✅" : "User Rejected ❌",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
  });

  // ✅ Update inventor/investor table row instantly
  const update = (prev) =>
    prev.map((u) =>
      u._id === userId
        ? { ...u, approvalStatus: status, isApproved: status === "approved" }
        : u
    );
  setInventors(update);
  setInvestors(update);

  // ✅ Remove from pending list
  setPendingUsers((prev) => prev.filter((u) => u._id !== userId));

  // ✅ Re-fetch to make sure everything is in sync
  await fetchPendingUsers();
  await fetchAllData();
};




  // ----------------- Delete User -----------------
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const data = await safeFetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    });
    if (!data) return;
    alert(data.message);
    if (role === "inventor") setInventors((prev) => prev.filter((u) => u._id !== id));
    else setInvestors((prev) => prev.filter((u) => u._id !== id));
    setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
  };

  // ----------------- Edit User -----------------
  const handleEditUser = async (id, role, updatedData) => {
    const data = await safeFetch(`http://localhost:5000/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      body: JSON.stringify(updatedData),
    });
    if (!data) return;
    alert(data.message);
    if (role === "inventor") setInventors((prev) => prev.map((u) => (u._id === id ? { ...u, ...updatedData } : u)));
    else setInvestors((prev) => prev.map((u) => (u._id === id ? { ...u, ...updatedData } : u)));
  };

  // ----------------- Update Project Status -----------------
  const handleUpdateProjectStatus = async (project, status, reason = "") => {
    const data = await safeFetch(`http://localhost:5000/api/projects/${project._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, reason }),
    });
    if (!data) { alert("Failed to update project!"); return; }
    setProjects((prev) => prev.map((p) => (p._id === project._id ? data.project : p)));
    alert(`Project ${status} successfully`);
  };

  const handleMarkAsSold = async (projectId, investorId) => {
    const response = await safeFetch(
      `http://localhost:5000/api/projects/${projectId}/approve-request/${investorId}`,
      { method: "PUT", headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) } }
    );
    if (!response) { alert("Failed to mark project as sold!"); return; }
    setProjects((prev) => prev.map((p) => (p._id === projectId ? response.project : p)));
    alert("💰 Project sold successfully!");
  };

  const getProjectStatsFromBackend = (projectId) => {
    let totalPayments = 0, totalAmount = 0, paid = 0, pending = 0;
    let investorsSet = new Set(), paidInvestors = [];
    payments.forEach((payment) => {
      if (!Array.isArray(payment.projects)) return;
      payment.projects.forEach((proj) => {
        const pid = String(proj.projectId?._id || proj.projectId);
        if (pid === String(projectId)) {
          totalPayments++;
          totalAmount += Number(proj.amount || 0);
          investorsSet.add(payment.email);
          if (payment.status === "success") { paid++; paidInvestors.push(payment.email); }
          else pending++;
        }
      });
    });
    return { totalPayments, totalAmount, investors: investorsSet.size, paid, pending, paidInvestors };
  };

  // ✅ Helper: badge style based on approval status
  const approvalBadge = (status) => {
    if (status === "approved") return { background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" };
    if (status === "rejected") return { background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a" };
    return { background: "#fff8e1", color: "#f57f17", border: "1px solid #ffe082" };
  };

  // ✅ Helper: label for approval status
  const approvalLabel = (status) => {
    if (status === "approved") return "✅ Approved";
    if (status === "rejected") return "❌ Rejected";
    return "⏳ Pending";
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header" />

      {/* Stats */}
      <section className="stats-section">
        <div className="stat-card">👤 Total Users: {stats.totalUsers}</div>
        <div className="stat-card">📂 Total Projects: {stats.totalProjects}</div>
        <div className="stat-card">💰 Revenue: {Number(stats.totalRevenue).toLocaleString()} ETB</div>
        <div className="stat-card">📊 Approval Rate: {Number(stats.approvalRate || 0).toFixed(1)}%</div>
        <div className="stat-card">🛠️ Inventors: {inventors.length}</div>
        <div className="stat-card">💼 Investors: {investors.length}</div>
      </section>
<div className="charts-container">
  <section className="chart-section">
    <h3>📊 Project Status Chart</h3>
    <PieChart width={550} height={400}>
      <Pie
        data={[
          { name: "Approved", value: stats.approvedProjects },
          { name: "Rejected", value: stats.rejectedProjects },
          { name: "Pending", value: stats.pendingProjects },
        ]}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        <Cell fill="#4caf50" />
        <Cell fill="#f44336" />
        <Cell fill="#ff9800" />
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </section>

  <section className="chart-section">
    <h3>👥 Role Breakdown</h3>

    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={roleBarData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />

        <Bar dataKey="approved" stackId="a" fill="#4caf50" radius={[10, 10, 0, 0]} />
        <Bar dataKey="rejected" stackId="a" fill="#f44336" />
        <Bar dataKey="pending" stackId="a" fill="#ff9800" />
      </BarChart>
    </ResponsiveContainer>
  </section>

  <section className="chart-section">
   <h3>💰 Payments vs Needed Amount</h3>

  <ResponsiveContainer width="100%" height={350}>
    <AreaChart data={getMonthlyPaymentData()}>
      <defs>
        <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
        </linearGradient>

        <linearGradient id="colorNeeded" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
        </linearGradient>
      </defs>

      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <CartesianGrid strokeDasharray="3 3" />

      {/* Needed Amount (Red like your image) */}
      <Area
        type="monotone"
        dataKey="needed"
        stroke="#f44336"
        fillOpacity={1}
        fill="url(#colorNeeded)"
      />

      {/* Paid Amount (Green like your image) */}
      <Area
        type="monotone"
        dataKey="paid"
        stroke="#4caf50"
        fillOpacity={1}
        fill="url(#colorPaid)"
      />
    </AreaChart>
  </ResponsiveContainer>
</section>

</div>
     

      {/* ✅ INVENTORS TABLE — with Status + Approve/Reject */}
      <section className="users-section">
        <h2>Inventors</h2>
        {inventors.length === 0 ? <p>No inventors found.</p> : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Project</th><th>Skills</th>
                <th>Experience</th><th>National ID</th><th>Passport</th>
                <th>Portfolio</th><th>Patent</th><th>Team</th>
                <th>Status</th>{/* ✅ NEW */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventors.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.project || "-"}</td>
                  <td>{u.skills || "-"}</td>
                  <td>{u.experience || "-"}</td>
                  <td>{u.nationalId || "-"}</td>
                  <td>{u.passportNumber || "-"}</td>
                  <td>{u.portfolio || "-"}</td>
                  <td>{u.patentStatus || "-"}</td>
                  <td>{u.teamSize || "-"}</td>

                  {/* ✅ Approval Status Badge */}
                  <td>
                    <span style={{
                      ...approvalBadge(u.approvalStatus),
                      padding: "3px 10px", borderRadius: "12px",
                      fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap"
                    }}>
                      {approvalLabel(u.approvalStatus)}
                    </span>
                  </td>

                  {/* ✅ Actions: Delete + Edit + Approve + Reject */}
                  <td>
                    <div className="button-group">
                      <button className="delete" onClick={() => handleDeleteUser(u._id, "inventor")}>
                        Delete
                      </button>
                      <button className="edit" onClick={() => { setEditingUser(u); setShowEditForm(true); }}>
                        Edit
                      </button>
                      {u.approvalStatus !== "approved" && (
                        <button
                          className="approve-btn"
                          onClick={() => handleUserApproval(u._id, "approved")}
                        >
                          ✅ Approve
                        </button>
                      )}
                      {u.approvalStatus !== "rejected" && (
                        <button
                          className="reject-btn"
                          onClick={async () => {
                            const { value: reason } = await Swal.fire({
                              title: "Rejection Reason",
                              input: "text",
                              inputPlaceholder: "Reason for rejection...",
                              showCancelButton: true,
                            });
                            if (reason) handleUserApproval(u._id, "rejected", reason);
                          }}
                        >
                          ❌ Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ✅ INVESTORS TABLE — with Status + Approve/Reject */}
      <section className="users-section">
        <h2>Investors</h2>
        {investors.length === 0 ? <p>No investors found.</p> : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Company</th><th>Budget</th>
                <th>Industry</th><th>Investment Type</th><th>National ID</th><th>Passport</th>
                <th>Status</th>{/* ✅ NEW */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.company || "-"}</td>
                  <td>{u.budget || 0}</td>
                  <td>{u.industryFocus || "-"}</td>
                  <td>{u.investmentType || "-"}</td>
                  <td>{u.nationalId || "-"}</td>
                  <td>{u.passportNumber || "-"}</td>

                  {/* ✅ Approval Status Badge */}
                  <td>
                    <span style={{
                      ...approvalBadge(u.approvalStatus),
                      padding: "3px 10px", borderRadius: "12px",
                      fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap"
                    }}>
                      {approvalLabel(u.approvalStatus)}
                    </span>
                  </td>

                  {/* ✅ Actions: Delete + Edit + Approve + Reject */}
                  <td>
                    <div className="button-group">
                      <button className="delete" onClick={() => handleDeleteUser(u._id, "investor")}>
                        Delete
                      </button>
                      <button className="edit" onClick={() => { setEditingUser(u); setShowEditForm(true); }}>
                        Edit
                      </button>
                      {u.approvalStatus !== "approved" && (
                        <button
                          className="approve-btn"
                          onClick={() => handleUserApproval(u._id, "approved")}
                        >
                          ✅ Approve
                        </button>
                      )}
                      {u.approvalStatus !== "rejected" && (
                        <button
                          className="reject-btn"
                          onClick={async () => {
                            const { value: reason } = await Swal.fire({
                              title: "Rejection Reason",
                              input: "text",
                              inputPlaceholder: "Reason for rejection...",
                              showCancelButton: true,
                            });
                            if (reason) handleUserApproval(u._id, "rejected", reason);
                          }}
                        >
                          ❌ Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Edit User Form — unchanged */}
      {showEditForm && editingUser && (
        <section className="edit-user-section">
          <h2>Edit User</h2>
          <input placeholder="Full Name" value={editingUser.name || ""}
            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
          <input placeholder="Email" value={editingUser.email || ""}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
          <select value={editingUser.role || ""}
            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
            <option value="inventor">Inventor</option>
            <option value="investor">Investor</option>
          </select>
          {editingUser.role === "inventor" && (<>
            <input placeholder="Project Summary" value={editingUser.project || ""}
              onChange={(e) => setEditingUser({ ...editingUser, project: e.target.value })} />
            <input placeholder="Skills" value={editingUser.skills || ""}
              onChange={(e) => setEditingUser({ ...editingUser, skills: e.target.value })} />
            <input placeholder="Experience" value={editingUser.experience || ""}
              onChange={(e) => setEditingUser({ ...editingUser, experience: e.target.value })} />
            <input placeholder="Portfolio" value={editingUser.portfolio || ""}
              onChange={(e) => setEditingUser({ ...editingUser, portfolio: e.target.value })} />
            <select value={editingUser.patentStatus || ""}
              onChange={(e) => setEditingUser({ ...editingUser, patentStatus: e.target.value })}>
              <option value="">Patent Status</option>
              <option value="not-applied">Not Applied</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <input type="number" placeholder="Team Size" value={editingUser.teamSize || ""}
              onChange={(e) => setEditingUser({ ...editingUser, teamSize: e.target.value })} />
          </>)}
          {editingUser.role === "investor" && (<>
            <input placeholder="Company Name" value={editingUser.company || ""}
              onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })} />
            <input type="number" placeholder="Budget" value={editingUser.budget || ""}
              onChange={(e) => setEditingUser({ ...editingUser, budget: e.target.value })} />
            <input placeholder="Industry Focus" value={editingUser.industryFocus || ""}
              onChange={(e) => setEditingUser({ ...editingUser, industryFocus: e.target.value })} />
            <select value={editingUser.investmentType || ""}
              onChange={(e) => setEditingUser({ ...editingUser, investmentType: e.target.value })}>
              <option value="">Investment Type</option>
              <option value="equity">Equity</option>
              <option value="loan">Loan</option>
              <option value="grant">Grant</option>
            </select>
          </>)}
          <input placeholder="National ID" value={editingUser.nationalId || ""}
            onChange={(e) => setEditingUser({ ...editingUser, nationalId: e.target.value })} />
          <input placeholder="Passport Number" value={editingUser.passportNumber || ""}
            onChange={(e) => setEditingUser({ ...editingUser, passportNumber: e.target.value })} />
          <button onClick={() => { handleEditUser(editingUser._id, editingUser.role, editingUser); setShowEditForm(false); setEditingUser(null); }}>
            Save Changes
          </button>
          <button onClick={() => { setShowEditForm(false); setEditingUser(null); }}>Cancel</button>
        </section>
      )}

      {/* Payments Section — unchanged */}
      <div className="payments-section">
        <h2>💰 Payments</h2>
        {payments.length === 0 ? <p>No payments yet.</p> : (
          <table>
            <thead>
              <tr><th>Investor</th><th>Project</th><th>Amount (ETB)</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <React.Fragment key={p._id}>
                  {(p.projects || []).length > 0 ? (
                    p.projects.map((proj, idx) => (
                      <tr key={proj.projectId + idx}>
                        <td>{p.email}</td>
                        <td>{proj.projectName || "N/A"}</td>
                        <td>{proj.amount}</td>
                        <td className={p.status === "Paid" ? "status-paid" : p.status === "Pending" ? "status-pending" : "status-failed"}>
                          {p.status}
                        </td>
                        <td>{new Date(p.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr key={p._id}>
                      <td>{p.email}</td><td>-</td><td>{p.amount}</td>
                      <td>{p.status}</td><td>{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Projects Section — unchanged */}
      <section className="projects-section">
        <h2>All Projects</h2>
        {projects.length === 0 ? <p>No projects yet.</p> : (
          <div className="projects-grid">
            {projects.map((p) => (
              <article key={p._id} className="project-card">
                <img
                  src={p.images?.[0] ? (p.images[0].startsWith("http") ? p.images[0] : `http://localhost:5000${p.images[0]}`) : "https://via.placeholder.com/200"}
                  alt={p.title} className="project-image"
                />
                <div className="project-content">
                  <h3>{p.title}</h3>
                  <p><strong>Description:</strong> {p.description}</p>
                  <p><strong>Problem Statement:</strong> {p.problemStatement}</p>
                  <p>Price: ${p.price || 0}</p>
                  <p>Expected Profit: ${p.expectedProfit || 0}</p>
                  <p>Status: {p.status === "Approved" ? <span className="approved">✅ Approved</span>
                    : p.status === "Rejected" ? <span className="rejected">❌ Rejected</span>
                    : <span className="pending">⏳ Pending</span>}
                  </p>
                  <div className="project-actions">
                    {p.status !== "Approved" && (
                      <button className="approve-btn" onClick={() => handleUpdateProjectStatus(p, "Approved")}>✅ Approve</button>
                    )}
                    {p.status !== "Rejected" && (
                      <button className="reject-btn" onClick={() => { setSelectedProject(p); setShowRejectBox(true); }}>❌ Reject</button>
                    )}
                  </div>
                  {p.status === "Approved" && (() => {
                    const s = getProjectStatsFromBackend(p._id);
                    return (
                      <div className="admin-project-stats">
                        <h4>📊 Payments Overview</h4>
                        <p>💰 Payments Count: {s.totalPayments}</p>
                        <p>👥 Investors: {s.investors}</p>
                        <p>💵 Total Raised: {s.totalAmount} ETB</p>
                        <p>✅ Paid: {s.paid} | ⏳ Pending: {s.pending}</p>
                        <div className="investor-list">
                          <h5>👤 Paid Investors</h5>
                          {s.paidInvestors.length === 0 ? <p>No paid investors yet</p>
                            : s.paidInvestors.map((email, i) => <div key={i}>{email}</div>)}
                        </div>
                      </div>
                    );
                  })()}
                  {showRejectBox && selectedProject && (
                    <div className="reject-overlay">
                      <div className="reject-box">
                        <h3>Reject Project: {selectedProject.title}</h3>
                        <textarea placeholder="Enter reason for rejection..." value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)} rows={4} />
                        <div className="button-group">
                          <button onClick={async () => {
                            if (!rejectReason.trim()) { alert("Please provide a rejection reason!"); return; }
                            await handleUpdateProjectStatus(selectedProject, "Rejected", rejectReason);
                            setRejectReason(""); setSelectedProject(null); setShowRejectBox(false);
                          }}>Submit</button>
                          <button onClick={() => { setShowRejectBox(false); setRejectReason(""); setSelectedProject(null); }}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(p.images || []).map((img) => (
                    <img key={img} src={img.startsWith("http") ? img : `http://localhost:5000${img}`} alt="Project" className="project-media" />
                  ))}
                  {p.videos?.map((vid) => (
                    <video key={vid} src={vid.startsWith("http") ? vid : `http://localhost:5000${vid}`} controls className="project-media" />
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;