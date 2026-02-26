import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaDollarSign, FaTimes } from "react-icons/fa";
import "./Dashboard.css";

function InvestorDashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [supportAmounts, setSupportAmounts] = useState({});
  const [totalSupport, setTotalSupport] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
const userId = user?._id;


const handleRequestInvestment = async (projectId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/projects/${projectId}/request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    // ✅ update UI instantly
    setProjects(prev =>
      prev.map(p =>
        p._id === projectId ? data.project : p
      )
    );

    alert("✅ Request sent. Project moved to Pending!");

  } catch (err) {
    console.error(err);
  }
};



  // ---------------- Fetch projects ----------------
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProjects(data);

        // Initialize total support
        const supportData = {};
        data.forEach((p) => {
          supportData[p._id] = p.totalSupport || 0;
        });
        setTotalSupport(supportData);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [token]);

  const categories = [
    "All", "Health", "Education", "Agriculture", "Energy", "Finance",
    "Software Solutions", "Manufacturing", "Transport", "Tourism",
    "Social", "Other",
  ];

  const filteredProjects = projects.filter((project) => {
    const matchSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchCategory = filterCategory === "All" || project.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const toggleFavorite = (projectId) => {
    setFavorites((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSupport = async (projectId, projectTitle, minAmount, fullPrice, status) => {
    if (status !== "Approved") {
      alert("You can only support Approved projects.");
      return;
    }

    const amount = parseFloat(supportAmounts[projectId]);
    if (!amount || amount < minAmount) {
      alert(`Please enter a valid amount (min $${minAmount}).`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Failed to support project");

      const updated = await res.json();

      setTotalSupport((prev) => ({
        ...prev,
        [projectId]: updated.totalSupport,
      }));

      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, totalSupport: updated.totalSupport } : p))
      );

      alert(
        `You supported "${projectTitle}" with $${amount}. Total supported: $${updated.totalSupport}/${fullPrice}`
      );

      setSupportAmounts((prev) => ({ ...prev, [projectId]: "" }));
    } catch (err) {
      console.error("Error supporting project:", err);
    }
  };

  const handleAskQuestion = async (projectId) => {
    const questionText = prompt("Enter your question:");
    if (!questionText) return;

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: questionText }),
      });
      if (!res.ok) throw new Error("Failed to submit question");

      const updated = await res.json();

      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? updated : p))
      );
      if (selectedProject?._id === projectId) setSelectedProject(updated);

      alert("Question submitted!");
    } catch (err) {
      console.error("Error adding question:", err);
    }
  };

  return (
    <div className="investor-dashboard">
      <h1>Investor Dashboard</h1>

      {/* Search & Filter */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Projects List */}
      <div className="project-list">
        {filteredProjects.map((project) => (
          <div key={project._id} className="project-card">
            <h2>{project.title}</h2>
            <p>Category: {project.category}</p>
            <p><strong>Problem Statement:</strong> {project.problemStatement || "N/A"}</p>
            <p>Price: ${project.price} | Expected Profit: ${project.expectedProfit}</p>
            <p>
              Status:{" "}
              <span
                className={
                  project.status === "Approved"
                    ? "status-approved"
                    : project.status === "Rejected"
                    ? "status-rejected"
                    : project.status === "Sold"
                    ? "status-sold"
                    : "status-pending"
                }
              >
                {project.status}
              </span>
            </p>
                 {project.status === "Sold" && project.soldTo && (
  <p className="sold-to">
    💰 Sold to {project.soldTo.name} 
  </p>
)}
                      
            <div className="media">
              {(project.images || []).slice(0, 1).map((img, idx) => (
                <img key={idx} src={img.startsWith("http") ? img : `http://localhost:5000${img}`} alt="" width="200" />
              ))}
              {(project.videos || []).slice(0, 1).map((vid, idx) => (
                <video key={idx} src={vid.startsWith("http") ? vid : `http://localhost:5000${vid}`} controls width="200" />
              ))}
            </div>

            <div className="card-buttons">
              <button onClick={() => toggleFavorite(project._id)}>
                {favorites.includes(project._id) ? <FaStar /> : <FaRegStar />}
              </button>
              
                     {(() => {
  const myRequest = project.investmentRequests?.find(
    (r) =>
      r.investor?.toString() === userId ||
      r.investor?._id?.toString() === userId
  );

if (project.status === "Sold") {
  return (
    <button disabled>
      {project.soldTo?._id === userId ? "Your Project ✅" : "Sold"}
    </button>
  );
}

  if (myRequest) {
    return (
      <button disabled>
        {myRequest.status === "Pending" && "Request Pending"}
        {myRequest.status === "Approved" && "Approved ✅"}
        {myRequest.status === "Rejected" && "Rejected ❌"}
      </button>
    );
  }

  return (
    <button onClick={() => handleRequestInvestment(project._id)}>
      Request to Invest
    </button>
  );
})()}




              <button onClick={() => setSelectedProject(project)}>View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedProject(null)}>
              <FaTimes />
            </button>
            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>
            <p><strong>Problem Statement:</strong> {selectedProject.problemStatement || "N/A"}</p>
            <p>Price: ${selectedProject.price} | Expected Profit: ${selectedProject.expectedProfit}</p>
            <p>Category: {selectedProject.category}</p>
            <p>
              Status:{" "}
              <span
                className={
                  selectedProject.status === "Approved"
                    ? "status-approved"
                    : selectedProject.status === "Rejected"
                    ? "status-rejected"
                    
                    : "status-pending"
                }
              >
                {selectedProject.status}
              </span>
            </p>
           

            <div className="media">
              {(selectedProject.images || []).map((img, idx) => (
                <img key={idx} src={img.startsWith("http") ? img : `http://localhost:5000${img}`} alt="" width="300" />
              ))}
              {(selectedProject.videos || []).map((vid, idx) => (
                <video key={idx} src={vid.startsWith("http") ? vid : `http://localhost:5000${vid}`} controls width="300" />
              ))}
            </div>

            <div className="questions">
              <h3>Questions</h3>
              {selectedProject.questions?.length === 0 && <p>No questions yet.</p>}
              {selectedProject.questions?.map((q) => (
                <p key={q._id}>Q: {q.text}</p>
              ))}
              <button onClick={() => handleAskQuestion(selectedProject._id)}>Ask Question</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default InvestorDashboard;
