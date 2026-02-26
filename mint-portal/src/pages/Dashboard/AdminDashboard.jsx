import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function AdminDashboard() {
  const [inventors, setInventors] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0 });

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "inventor",
    project: "",
    skills: "",
    experience: "",
    company: "",
    budget: "",
  });

  const token = localStorage.getItem("token");
const [editingUser, setEditingUser] = useState(null);
const [showEditForm, setShowEditForm] = useState(false);
const [showRejectBox, setShowRejectBox] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);
const [rejectReason, setRejectReason] = useState("");


  // ----------------- Safe Fetch -----------------
  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text(); // read raw response
      let data;
      try {
        data = JSON.parse(text); // try parse JSON
      } catch (err) {
        throw new Error(`Invalid JSON response from ${url}: ${text}`);
      }
      if (!res.ok) throw new Error(data.message || `HTTP error ${res.status}`);
      return data;
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      return null;
    }
  };

  // ----------------- Backend Fetches -----------------
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
    return data || [];
  };

  const fetchAllData = async () => {
    try {
      const [inventorsData, investorsData, projectsData] = await Promise.all([
        fetchInventors(),
        fetchInvestors(),
        fetchProjects(),
      ]);

      setInventors(inventorsData);
      setInvestors(investorsData);
      setProjects(projectsData);

      setStats({
        totalUsers: inventorsData.length + investorsData.length,
        totalProjects: projectsData.length,
      });
    } catch (err) {
      console.error("Error fetching all data:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ----------------- Add User -----------------
  const handleAddUser = async () => {
    const data = await safeFetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(newUser),
    });

    if (!data) return;

    alert("User added successfully!");
    setShowAddUser(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "inventor",
      project: "",
      skills: "",
      experience: "",
      company: "",
      budget: "",
    });
    fetchAllData();
  };

  // ----------------- Delete User -----------------
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const data = await safeFetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!data) return;

    alert(data.message);

    if (role === "inventor") {
      setInventors((prev) => prev.filter((u) => u._id !== id));
    } else {
      setInvestors((prev) => prev.filter((u) => u._id !== id));
    }

    setStats((prev) => ({
      ...prev,
      totalUsers: prev.totalUsers - 1,
    }));
  };
  


  // ----------------- Edit User -----------------
const handleEditUser = async (id, role, updatedData) => {
  const data = await safeFetch(`http://localhost:5000/api/users/${id}`, {
    method: "PUT", // or PATCH if your backend supports partial update
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(updatedData),
  });

  if (!data) return;

  alert(data.message);

  if (role === "inventor") {
    setInventors((prev) =>
      prev.map((u) => (u._id === id ? { ...u, ...updatedData } : u))
    );
  } else {
    setInvestors((prev) =>
      prev.map((u) => (u._id === id ? { ...u, ...updatedData } : u))
    );
  }
};


  // ----------------- Update Project Status -----------------
const handleUpdateProjectStatus = async (project, status, reason = "") => {
  const updatedProject = await safeFetch(
    `http://localhost:5000/api/projects/${project._id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status, reason }),
    }
  );

  if (!updatedProject) {
    alert("Failed to update project status!");
    return;
  }

  setProjects((prev) =>
    prev.map((p) => (p._id === project._id ? updatedProject : p))
  );

  alert(
    status === "Approved"
      ? "✅ Project approved successfully!"
      : `❌ Project rejected for reason: ${reason}`
  );
};



const handleMarkAsSold = async (projectId, investorId) => {
  const response = await safeFetch(
    `http://localhost:5000/api/projects/${projectId}/approve-request/${investorId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response) {
    alert("Failed to mark project as sold!");
    return;
  }

  // response.project because backend returns { message, project }
  setProjects((prev) =>
    prev.map((p) =>
      p._id === projectId ? response.project : p
    )
  );

  alert("💰 Project sold successfully!");
};


  // ----------------- Render -----------------
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => setShowAddUser(!showAddUser)}>
          {showAddUser ? "Cancel Add User" : "Add New User"}
        </button>
      </header>

      {/* Add User Form */}
      {showAddUser && (
        <section className="add-user-section">
          <h2>Add User</h2>
          <input
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="inventor">Inventor</option>
            <option value="investor">Investor</option>
          </select>

          {newUser.role === "inventor" && (
            <>
              <input
                placeholder="Project Summary"
                value={newUser.project}
                onChange={(e) => setNewUser({ ...newUser, project: e.target.value })}
              />
              <input
                placeholder="Skills"
                value={newUser.skills}
                onChange={(e) => setNewUser({ ...newUser, skills: e.target.value })}
              />
              <input
                placeholder="Experience"
                value={newUser.experience}
                onChange={(e) => setNewUser({ ...newUser, experience: e.target.value })}
              />
            </>
          )}

          {newUser.role === "investor" && (
            <>
              <input
                placeholder="Company Name"
                value={newUser.company}
                onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
              />
              <input
                placeholder="Budget"
                type="number"
                value={newUser.budget}
                onChange={(e) => setNewUser({ ...newUser, budget: e.target.value })}
              />
            </>
          )}

          <button onClick={handleAddUser}>Submit</button>
        </section>
      )}

      {/* Stats */}
      <section className="stats-section">
        <div className="stat-card">👤 Total Users: {stats.totalUsers}</div>
        <div className="stat-card">📂 Total Projects: {stats.totalProjects}</div>
        <div className="stat-card">🛠️ Inventors: {inventors.length}</div>
        <div className="stat-card">💼 Investors: {investors.length}</div>
      </section>

      {/* Users Sections */}
      <section className="users-section">
        <h2>Inventors</h2>
        {inventors.length === 0 ? (
          <p>No inventors found.</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Project</th>
                <th>Skills</th>
                <th>Experience</th>
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
                  <td>
                 <div className="button-group">
                 <button
          className="delete"
          onClick={() => handleDeleteUser(u._id, "investor")}
>
                    Delete
                  </button>
                  <button
                    className="edit"
                    onClick={() => {
                      setEditingUser(u);
                      setShowEditForm(true);
                    }}
                  >
                    Edit
                  </button>
                </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="users-section">
        <h2>Investors</h2>
        {investors.length === 0 ? (
          <p>No investors found.</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Budget</th>
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
                 <td>
               <div className="button-group">

              <button className="delete" onClick={() => handleDeleteUser(u._id, "inventor")}>
                Delete
              </button>
              <button
                className="edit"
                onClick={() => {
                  setEditingUser(u);
                  setShowEditForm(true);
                }}
              >
                Edit
              </button>
            </div>

                </td>

                </tr>
              ))}



            </tbody>
          </table>
        )}
      </section>
      {/* Edit User Form */}
{showEditForm && editingUser && (
  <section className="edit-user-section">
    <h2>Edit User</h2>
    <input
      placeholder="Full Name"
      value={editingUser.name}
      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
    />
    <input
      placeholder="Email"
      value={editingUser.email}
      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
    />
    <select
      value={editingUser.role}
      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
    >
      <option value="inventor">Inventor</option>
      <option value="investor">Investor</option>
    </select>

    {editingUser.role === "inventor" && (
      <>
        <input
          placeholder="Project Summary"
          value={editingUser.project || ""}
          onChange={(e) => setEditingUser({ ...editingUser, project: e.target.value })}
        />
        <input
          placeholder="Skills"
          value={editingUser.skills || ""}
          onChange={(e) => setEditingUser({ ...editingUser, skills: e.target.value })}
        />
        <input
          placeholder="Experience"
          value={editingUser.experience || ""}
          onChange={(e) => setEditingUser({ ...editingUser, experience: e.target.value })}
        />
      </>
    )}

    {editingUser.role === "investor" && (
      <>
        <input
          placeholder="Company Name"
          value={editingUser.company || ""}
          onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
        />
        <input
          placeholder="Budget"
          type="number"
          value={editingUser.budget || ""}
          onChange={(e) => setEditingUser({ ...editingUser, budget: e.target.value })}
        />
      </>
    )}

    <button
      onClick={() => {
        handleEditUser(editingUser._id, editingUser.role, editingUser);
        setShowEditForm(false);
        setEditingUser(null);
      }}
    >
      Save Changes
    </button>
    <button onClick={() => setShowEditForm(false)}>Cancel</button>
  </section>
)}


      {/* Projects Section */}
      <section className="projects-section">
        <h2>All Projects</h2>
        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((p) => (
              <article key={p._id} className="project-card">
                <img
                  src={
                    p.images?.[0]
                      ? p.images[0].startsWith("http")
                        ? p.images[0]
                        : `http://localhost:5000${p.images[0]}`
                      : "https://via.placeholder.com/200"
                  }
                  alt={p.title}
                  className="project-image"
                />
                <div className="project-content">
                  <h3>{p.title}</h3>
                  <p><strong>Description:</strong> {p.description}</p>
                  <p><strong>Problem Statement:</strong> {p.problemStatement}</p>
                  <p>Price: ${p.price || 0}</p>
                  <p>Expected Profit: ${p.expectedProfit || 0}</p>
                  <p>
                    Status:{" "}
                    {p.status === "Approved" ? (
                      <span className="approved">✅ Approved</span>
                    ) : p.status === "Rejected" ? (
                      <span className="rejected">❌ Rejected</span>
                    ) :p.status === "Sold" ? (
                            <span style={{ color: "gold", fontWeight: "bold" }}>💰 Sold</span>
                          ) :(
                      <span className="pending">⏳ Pending</span>
                    )}
                  </p>
                {/* {p.status !== "Approved" && ( */}
                {p.status === "Sold" && p.soldTo && (
                  <p style={{ color: "gold", fontWeight: "bold" }}>
                    💰 Sold to {p.soldTo.name} ({p.soldTo.email})
                  </p>
                )}

                <div className="admin-actions">
                {p.status !== "Approved" && p.status !== "Sold" && (
                        <button onClick={() => handleUpdateProjectStatus(p, "Approved")}>
                          ✅ Approve
                        </button>
                      )}

                      {p.status !== "Rejected" && p.status !== "Sold" && (
                        <button
                          onClick={() => {
                            setSelectedProject(p);
                            setShowRejectBox(true);
                          }}
                        >
                          ❌ Reject
                        </button>
                      )}
                          {p.status === "Approved" && (
  <div className="investment-requests">

    <h4> Investment Requests</h4>

    {p.investmentRequests?.length === 0 && (
      <p>No investors requested yet.</p>
    )}

    {p.investmentRequests?.map((r) => {
      const investor =
        typeof r.investor === "object" ? r.investor : null;

      if (!investor) return null;

      return (
        <div key={investor._id} className="request-row">

          <span>
            👤 {investor.name} — {investor.email}
          </span>

          <button
            className="sell-btn"
            onClick={() =>
              handleMarkAsSold(p._id, investor._id)
            }
            disabled={p.status === "Sold"}
          >
            💰 Sell Project
          </button>

        </div>
      );
    })}
  </div>
)}


              </div>
                {showRejectBox && selectedProject && (
                  <div className="reject-overlay">
                    <div className="reject-box">
                      <h3>Reject Project: {selectedProject.title}</h3>
                      <textarea
                        placeholder="Enter reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                      />
                      <div className="button-group">
                        <button
                          onClick={async () => {
                            if (!rejectReason.trim()) {
                              alert("Please provide a rejection reason!");
                              return;
                            }
                            await handleUpdateProjectStatus(selectedProject, "Rejected", rejectReason);
                            setRejectReason("");
                            setSelectedProject(null);
                            setShowRejectBox(false);
                          }}
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectBox(false);
                            setRejectReason("");
                            setSelectedProject(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}



                  {/* Media gallery */}
                 {p.images.map((img) => (
                  <img
                    key={img}
                    src={img.startsWith("http")
                      ? img
                      : `http://localhost:5000${img}`}
                    alt="Project"
                    className="project-media"
                  />
                ))}

              {p.videos.map((vid) => (
  <video
    key={vid}
    src={vid.startsWith("http")
      ? vid
      : `http://localhost:5000${vid}`}
    controls
    className="project-media"
  />
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
