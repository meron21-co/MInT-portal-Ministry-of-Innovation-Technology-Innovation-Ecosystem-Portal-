import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Dashboard.css";
import Chart from "chart.js/auto";


// ============================================================
// UTILS — charts (inlined)
// ============================================================

function destroyChart(ref) {
  if (ref.current) { ref.current.destroy(); ref.current = null; }
}

function initFundingChart(canvas, payments = [0], mode = "monthly") {
  const labels = mode === "weekly"
    ? ["Week 1","Week 2","Week 3","Week 4"]
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const data = new Array(labels.length).fill(0);

  (Array.isArray(payments) ? payments : []).forEach((payment) => {
    if (payment.status !== "success") return;

    const date = new Date(payment.createdAt);
    if (isNaN(date)) return;

    let index = 0;

    if (mode === "monthly") {
      index = date.getMonth(); // 0–11
    } else {
      const day = date.getDate();
      index = Math.min(Math.floor((day - 1) / 7), 3); // week 0–3
    }

    const amount = payment.projects?.reduce((sum, p) => {
      return sum + Number(p.amount || 0);
    }, 0) || 0;

    data[index] += amount;
  });

  return new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Funding (ETB)",
        data,
        fill: true,
        backgroundColor: "rgba(232,160,32,0.12)",
        borderColor: "#E8A020",
        borderWidth: 2.5,
        pointBackgroundColor: "#E8A020",
        pointRadius: 4,
        tension: 0.4
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#888" } },
        y: {
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            callback: (v) => `${(v / 1000).toFixed(0)}k`
          }
        }
      }
    }
  });
}




function initStatusChart(canvas, counts = {}) {
  const { Approved=0, Pending=0, Rejected=0, Sold=0 } = counts;
  return new Chart(canvas, {
    type: "doughnut",
    data: {
      labels:["Approved","Pending","Rejected","Sold"],
      datasets:[{ data:[Approved,Pending,Rejected,Sold],
        backgroundColor:["#1D9E75","#E8A020","#E24B4A","#378ADD"], borderWidth:0, hoverOffset:6 }],
    },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:"68%",
      plugins:{ legend:{ display:false },
        tooltip:{ callbacks:{ label:(ctx)=>` ${ctx.label}: ${ctx.parsed}` } } },
    },
  });
}

function initBarChart(canvas, projectData = []) {
  const labels  = projectData.map((p) => p.name.length > 14 ? p.name.slice(0,14)+"…" : p.name);
  const raised  = projectData.map((p) => p.raised);
  const targets = projectData.map((p) => p.target);
  return new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets:[
        { label:"Raised", data:raised,  backgroundColor:"#E8A020", borderRadius:4, barPercentage:0.5 },
        { label:"Target", data:targets, backgroundColor:"#B4B2A9", borderRadius:4, barPercentage:0.5 },
      ],
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ display:false }, ticks:{ color:"#888", font:{ size:11 } } },
        y:{ grid:{ color:"rgba(0,0,0,0.05)" },
            ticks:{ color:"#888", font:{ size:11 }, callback:(v)=>`${(v/1000).toFixed(0)}k` } },
      },
    },
  });
}


// ============================================================
// UTILS — animations (inlined)
// ============================================================

function animateCountUp(el) {
  if (!el) return;
  const target    = parseFloat(el.dataset.target) || 0;
  const prefix    = el.dataset.prefix ?? "";
  const suffix    = el.dataset.suffix ?? "";
  const duration  = 1200;
  const steps     = Math.round((duration / 1000) * 60);
  const increment = target / steps;
  let current = 0, step = 0;
  const format = (val) => {
    if (target >= 1000)           return Math.round(val).toLocaleString();
    if (Number.isInteger(target)) return Math.round(val).toString();
    return val.toFixed(1);
  };
  const timer = setInterval(() => {
    step++; current += increment;
    if (step >= steps) { clearInterval(timer); current = target; }
    el.textContent = `${prefix}${format(current)}${suffix}`;
  }, duration / steps);
}


// ============================================================
// COMPONENT — Approval Criteria
// ============================================================

function ApprovalCriteria() {
  const criteriaDetails = [
    { title:"Problem Statement",  description:"Measurable real-world issue" },
    { title:"Feasible Solution",  description:"Well-structured approach" },
    { title:"Budget Realism",     description:"Justified cost estimates" },
    { title:"Innovativeness",     description:"Novel or creative angle" },
    { title:"Media Quality",      description:"Clear docs & visuals" },
    { title:"Category Accuracy",  description:"Correct classification" },
    { title:"Impact & Value",     description:"Community benefit" },
    { title:"Scalability",        description:"Maintainable & scalable" },
    { title:"Compliance",         description:"Legal & ethical standards" },
    { title:"Description",        description:"Complete methodology & timeline" },
  ];
  return (
    <div className="section-card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-dot dot-gold"></span>Approval Checklist
        </div>
      </div>
      <div className="criteria-grid">
        {criteriaDetails.map((c, i) => (
          <div key={i} className="criteria-item">
            <div className="criteria-check">✓</div>
            <div>
              <div className="criteria-name">{c.title}</div>
              <div className="criteria-desc">{c.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================================================
// COMPONENT — Question Card
// ============================================================

function QuestionCard({ question, onAnswerUpdated }) {
  const [answer,    setAnswer]    = useState(question.answer?.text      || "");
  const [resolved,  setResolved]  = useState(question.answer?.resolved  || false);
  const [highlight, setHighlight] = useState(question.answer?.highlight || false);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    await onAnswerUpdated(question._id, { text:answer, resolved, highlight });
  };

  return (
    <div className={`question-card ${highlight ? "highlighted" : ""}`}>
      <p className="question-text">{question.text}</p>
      <form onSubmit={handleAnswerSubmit} className="answer-form">
        <textarea placeholder="Type your answer..." value={answer}
          onChange={(e) => setAnswer(e.target.value)} />
        <div className="answer-options">
          <label>
            <input type="checkbox" checked={resolved}
              onChange={(e) => setResolved(e.target.checked)} /> Mark as Resolved
          </label>
          <label>
            <input type="checkbox" checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)} /> Highlight
          </label>
        </div>
        <button type="submit" className="save-answer-btn">Save Answer</button>
      </form>
      {question.answer && (
        <div className="existing-answer">
          <strong>Existing Answer:</strong>
          <p>{question.answer.text}</p>
          <p>Status: {question.answer.resolved ? "Resolved ✅" : "Pending ⏳"}</p>
        </div>
      )}
    </div>
  );
}


// ============================================================
// COMPONENT — Add / Edit Project
// ============================================================

function AddProject({ project, onProjectSaved, onCancel, currentUser }) {
  const [title,            setTitle]            = useState(project?.title            || "");
  const [description,      setDescription]      = useState(project?.description      || "");
  const [price,            setPrice]            = useState(project?.price            || "");
  const [problemStatement, setProblemStatement] = useState(project?.problemStatement || "");
  const [expectedProfit,   setExpectedProfit]   = useState(project?.expectedProfit   || "");
  const [category,         setCategory]         = useState(project?.category         || "Other");
  const [images,           setImages]           = useState(project?.images           || []);
  const [videos,           setVideos]           = useState(project?.videos           || []);
  const [newImages,        setNewImages]        = useState([]);
  const [newVideos,        setNewVideos]        = useState([]);

  const categories = [
    "Health","Education","Agriculture","Energy","Finance",
    "Software Solutions","Manufacturing","Transport","Tourism","Social","Other",
  ];

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === "image") setNewImages((prev) => [...prev, ...files]);
    else                  setNewVideos((prev) => [...prev, ...files]);
  };

  const removeFile = (index, type, existing = false) => {
    if (type === "image") {
      if (existing) setImages((prev)    => prev.filter((_,i) => i !== index));
      else          setNewImages((prev) => prev.filter((_,i) => i !== index));
    }
    if (type === "video") {
      if (existing) setVideos((prev)    => prev.filter((_,i) => i !== index));
      else          setNewVideos((prev) => prev.filter((_,i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) { alert("User not logged in!"); return; }
    const formData = new FormData();
    if (project?._id)   formData.append("_id",            project._id);
    formData.append("title",            title);
    formData.append("description",      description);
    formData.append("price",            price);
    formData.append("problemStatement", problemStatement);
    formData.append("expectedProfit",   expectedProfit);
    formData.append("category",         category);
    formData.append("inventorName",     currentUser.name  || "Unknown");
    formData.append("inventorEmail",    currentUser.email || "Unknown");
    newImages.forEach((file) => formData.append("images", file));
    newVideos.forEach((file) => formData.append("videos", file));
    images.forEach((url)    => formData.append("existingImages", url));
    videos.forEach((url)    => formData.append("existingVideos", url));
    onProjectSaved(formData, project?._id);
  };

  const mediaSrc = (url) => url.startsWith("http") ? url : `http://localhost:5000${url}`;

  return (
    <div className="add-project-panel">
      <div className="add-project-header">
        <h2 className="add-project-title">{project ? "✏️ Edit Project" : "➕ New Invention"}</h2>
        <button className="close-panel-btn" onClick={onCancel}>✕</button>
      </div>
      <form onSubmit={handleSubmit} className="project-form">

        <div className="form-group">
          <label className="form-label">Project Title</label>
          <input type="text" className="form-input" placeholder="e.g. BioFilter Water Purifier"
            value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="Describe your invention..."
            value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Problem Statement</label>
          <textarea className="form-textarea" placeholder="What real-world problem does this solve?"
            value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Price (ETB)</label>
            <input type="number" className="form-input" placeholder="0"
              value={price} onChange={(e) => setPrice(e.target.value)} min={0} />
          </div>
          <div className="form-group">
            <label className="form-label">Expected Profit in 3 Months(ETB)</label>
            <input type="number" className="form-input" placeholder="0"
              value={expectedProfit} onChange={(e) => setExpectedProfit(e.target.value)} min={0} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Images</label>
          <input type="file" className="form-file" accept="image/*" multiple
            onChange={(e) => handleFileChange(e,"image")} />
          <div className="preview-container">
            {images.map((url,i) => (
              <div key={`ei-${i}`} className="media-wrapper">
                <img src={mediaSrc(url)} alt="preview" className="preview-img" />
                <button type="button" className="remove-media-btn" onClick={() => removeFile(i,"image",true)}>✕</button>
              </div>
            ))}
            {newImages.map((file,i) => (
              <div key={`ni-${i}`} className="media-wrapper">
                <img src={URL.createObjectURL(file)} alt="preview" className="preview-img" />
                <button type="button" className="remove-media-btn" onClick={() => removeFile(i,"image")}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Videos</label>
          <input type="file" className="form-file" accept="video/*" multiple
            onChange={(e) => handleFileChange(e,"video")} />
          <div className="preview-container">
            {videos.map((url,i) => (
              <div key={`ev-${i}`} className="media-wrapper">
                <video src={mediaSrc(url)} controls className="preview-video" />
                <button type="button" className="remove-media-btn" onClick={() => removeFile(i,"video",true)}>✕</button>
              </div>
            ))}
            {newVideos.map((file,i) => (
              <div key={`nv-${i}`} className="media-wrapper">
                <video src={URL.createObjectURL(file)} controls className="preview-video" />
                <button type="button" className="remove-media-btn" onClick={() => removeFile(i,"video")}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">{project ? "Save Changes" : "Save Project"}</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}


// ============================================================
// COMPONENT — Status Badge
// ============================================================

function StatusBadge({ status }) {
  const map = { Approved:"badge-approved", Pending:"badge-pending", Rejected:"badge-rejected", Sold:"badge-sold" };
  return <span className={`status-badge ${map[status] || "badge-pending"}`}>{status}</span>;
}


// ============================================================
// COMPONENT — Project Card
// ============================================================

function ProjectCard({ project, role, currentUser, payments, onEdit, onStatusChange,onDelete }) {
const raised = payments.reduce((total, payment) => {
  if (payment.status !== "success") return total;
  if (!Array.isArray(payment.projects)) return total;

  const projectTotal = payment.projects.reduce((sum, proj) => {
    const pid = proj?.projectId?._id || proj?.projectId;

    if (String(pid) === String(project._id)) {
      return sum + Number(proj?.amount || 0);
    }
    return sum;
  }, 0);

  return total + projectTotal;
}, 0);

  const pct = project.price > 0 ? Math.min((raised / project.price) * 100, 100) : 0;

  const categoryIcons = {
    Health:"🌿", Energy:"⚡", Education:"📚", Agriculture:"🌾",
    Finance:"💳", "Software Solutions":"💻", Manufacturing:"🏭",
    Transport:"🚗", Tourism:"✈️", Social:"🤝", Other:"💡",
  };

  const mediaSrc = (url) => url.startsWith("http") ? url : `http://localhost:5000${url}`;

  return (
    <article className="project-card">
      <div className="project-card-top">
        <div className="project-icon-wrap">
          <span className="project-icon">{categoryIcons[project.category] || "💡"}</span>
        </div>
        <div className="project-card-info">
          <h3 className="project-title">{project.title}</h3>
          {project.category && <span className="project-category-badge">{project.category}</span>}
        </div>
        <StatusBadge status={project.status} />
      </div>

      <p className="project-description">{project.description}</p>

      <div className="project-meta-row">
        <div className="meta-item">
          <span className="meta-label">Price</span>
          <span className="meta-value">{Number(project.price).toLocaleString()}ETB</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Expected Profit in 3 Months</span>
          <span className="meta-value">{Number(project.expectedProfit).toLocaleString()}ETB</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Raised</span>
          <span className="meta-value raised-value">{raised.toLocaleString()} ETB</span>
        </div>
      </div>

      <div className="funding-progress">
        <div className="funding-label">
          <span>Funding progress</span>
          <strong>{Math.round(pct)}%</strong>
        </div>
        <div className="prog-wrap">
          <div className="prog-fill" style={{ width:`${pct}%` }} />
        </div>
      </div>

      {project.status === "Rejected" && project.rejectionReason && (
        <div className="rejection-banner">⚠️ Rejection reason: {project.rejectionReason}</div>
      )}

      {Array.isArray(project.images) && project.images.length > 0 && (
        <div className="media-gallery">
          {project.images.map((img,i) => <img key={i} src={mediaSrc(img)} alt="" className="project-image" />)}
        </div>
      )}

      {Array.isArray(project.videos) && project.videos.length > 0 && (
        <div className="media-gallery">
          {project.videos.map((vid,i) => <video key={i} src={mediaSrc(vid)} controls className="project-video" />)}
        </div>
      )}

      <div className="project-card-actions">

          {role === "inventor" &&
            project.inventorEmail === currentUser?.email &&
            project.status !== "Approved" && (
              <>
                <button className="edit-btn" onClick={() => onEdit(project)}>
                  ✏️ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => onDelete(project._id)}
                >
                  🗑️ Delete
                </button>
              </>
          )}

          {role === "admin" && project.status === "Pending" && (
            <>
              <button className="approve-btn" onClick={() => onStatusChange(project._id,"Approved")}>
                ✅ Approve
              </button>
              <button className="reject-btn" onClick={() => onStatusChange(project._id,"Rejected")}>
                ❌ Reject
              </button>
            </>
          )}

        </div>

    </article>
  );
}


// ============================================================
// COMPONENT — Charts Panel
// ============================================================

function ChartsPanel({ projects, payments, currentUser, role }) {
  const fundingRef      = useRef(null);
  const statusRef       = useRef(null);
  const barRef          = useRef(null);
  const fundingChartRef = useRef(null);
  const [activeTab, setActiveTab] = useState("monthly");

  const getProjectRaised = useCallback(
  (projectId) => {
    if (!projectId) return 0;

    return payments.reduce((total, payment) => {
      if (payment.status !== "success") return total;
      if (!Array.isArray(payment.projects)) return total;

      const projectTotal = payment.projects.reduce((sum, proj) => {
        const pid = proj?.projectId?._id || proj?.projectId;

        if (String(pid) === String(projectId)) {
          return sum + Number(proj?.amount || 0);
        }
        return sum;
      }, 0);

      return total + projectTotal;
    }, 0);
  },
  [payments]
);

  const myProjects = projects.filter((p) =>
    role === "inventor" ? p.inventorEmail === currentUser?.email : true
  );

  useEffect(() => {
    if (fundingRef.current) {
      destroyChart(fundingChartRef);
    fundingChartRef.current = initFundingChart(
  fundingRef.current,
  payments,
  activeTab
);
    }
    return () => destroyChart(fundingChartRef);
 }, [activeTab, payments]);

  useEffect(() => {
    let statusChart = null;
    let barChart    = null;
    if (statusRef.current) {
      const counts = {
        Approved: myProjects.filter((p) => p.status === "Approved").length,
        Pending:  myProjects.filter((p) => p.status === "Pending").length,
        Rejected: myProjects.filter((p) => p.status === "Rejected").length,
        Sold:     myProjects.filter((p) => p.status === "Sold").length,
      };
      statusChart = initStatusChart(statusRef.current, counts);
    }
    if (barRef.current) {
      const barData = myProjects.map((p) => ({
        name:   p.title,
        raised: getProjectRaised(p._id),
        target: Number(p.price) || 0,
      }));
      barChart = initBarChart(barRef.current, barData);
    }
    return () => {
      if (statusChart) statusChart.destroy();
      if (barChart)    barChart.destroy();
    };
  }, [projects, payments, getProjectRaised]);

  return (
    <>
      <div className="section-card">
        <div className="card-header">
          <div className="card-title">
            <span className="card-title-dot dot-gold"></span>Funding over time
          </div>
          <div className="tab-pills">
            <button className={`tab-pill ${activeTab==="monthly"?"active":""}`} onClick={() => setActiveTab("monthly")}>Monthly</button>
            <button className={`tab-pill ${activeTab==="weekly" ?"active":""}`} onClick={() => setActiveTab("weekly")}>Weekly</button>
          </div>
        </div>
        <div className="chart-wrap"><canvas ref={fundingRef} /></div>
      </div>

      <div className="section-card">
        <div className="card-header">
          <div className="card-title">
            <span className="card-title-dot dot-teal"></span>Project status
          </div>
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot" style={{background:"#1D9E75"}}></span>Approved</span>
          <span className="legend-item"><span className="legend-dot" style={{background:"#E8A020"}}></span>Pending</span>
          <span className="legend-item"><span className="legend-dot" style={{background:"#E24B4A"}}></span>Rejected</span>
          <span className="legend-item"><span className="legend-dot" style={{background:"#378ADD"}}></span>Sold</span>
        </div>
        <div className="chart-wrap" style={{height:"200px"}}><canvas ref={statusRef} /></div>
      </div>

      <div className="section-card chart-full">
        <div className="card-header">
          <div className="card-title">
            <span className="card-title-dot dot-purple"></span>Raised vs Target (ETB)
          </div>
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot" style={{background:"#E8A020"}}></span>Raised</span>
          <span className="legend-item"><span className="legend-dot" style={{background:"#B4B2A9"}}></span>Target</span>
        </div>
        <div className="chart-wrap" style={{height:"220px"}}><canvas ref={barRef} /></div>
      </div>
    </>
  );
}


// ============================================================
// MAIN — Inventor Dashboard
// ============================================================

function InventorDashboard({ role = "inventor" }) {
  const token = localStorage.getItem("token");

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") currentUser = JSON.parse(stored);
  } catch (err) { console.error("Failed to parse user:", err); }

  const [projects,       setProjects]       = useState([]);
  const [payments,       setPayments]       = useState([]);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const metricsRef = useRef([null, null, null, null]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProjects(await res.json());
    } catch (err) { console.error("Error fetching projects:", err); }
  }, [token]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments", {
        headers: { Authorization:`Bearer ${token}` },
      });
      setPayments((await res.json()) || []);
    } catch (err) { console.error("Error fetching payments:", err); }
  }, [token]);

  useEffect(() => {
    if (!currentUser) { alert("Please login first!"); window.location.href = "./login"; return; }
    fetchProjects();
    fetchPayments();
  }, [fetchProjects, fetchPayments]);

  useEffect(() => {
    if (projects.length === 0 && payments.length === 0) return;
    const timer = setTimeout(() => {
      metricsRef.current.forEach((el) => el && animateCountUp(el));
    }, 300);
    return () => clearTimeout(timer);
  }, [projects, payments]);



 const getProjectRaised = useCallback(
  (projectId) => {
    if (!projectId) return 0;

    return payments.reduce((total, payment) => {
      if (payment.status !== "success") return total;
      if (!Array.isArray(payment.projects)) return total;

      const projectTotal = payment.projects.reduce((sum, proj) => {
        const pid = proj?.projectId?._id || proj?.projectId;

        if (String(pid) === String(projectId)) {
          return sum + Number(proj?.amount || 0);
        }
        return sum;
      }, 0);

      return total + projectTotal;
    }, 0);
  },
  [payments]
);

  const handleProjectSaved = async (formData, projectId) => {
    try {
      const url    = projectId ? `http://localhost:5000/api/projects/${projectId}` : "http://localhost:5000/api/projects";
      const method = projectId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers:{ Authorization:`Bearer ${token}` }, body:formData });
      const updated = await res.json();
      setProjects((prev) =>
        projectId ? prev.map((p) => (p._id === projectId ? updated : p)) : [...prev, updated]
      );
      setShowAddForm(false);
      setEditingProject(null);
    } catch (err) { console.error("Error saving project:", err); }
  };

  const handleProjectStatusChange = async (id, status) => {
    try {
      let reason = "";
      if (status === "Rejected") {
        reason = prompt("Please enter a rejection reason:");
        if (!reason) return;
      }
      const res = await fetch(`http://localhost:5000/api/projects/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:    JSON.stringify({ status, reason }),
      });
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch (err) { console.error("Error updating status:", err); }
  };

  const handleAnswerUpdated = async (questionId, answer) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/questions/${questionId}/answer`, {
        method:  "PATCH",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:    JSON.stringify(answer),
      });
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err) { console.error("Error updating answer:", err); }
  };

  const visibleProjects = Array.isArray(projects)
    ? role === "inventor" ? projects.filter((p) => p.inventorEmail === currentUser?.email)
    : role === "admin"    ? projects
    : projects.filter((p) => ["Approved","Sold"].includes(p.status))
    : [];

  const myProjects          = projects.filter((p) => p.inventorEmail === currentUser?.email);
  const totalRaised         = myProjects.reduce((s,p) => s + getProjectRaised(p._id), 0);
  const approvedCount       = myProjects.filter((p) => p.status === "Approved").length;
  const avgFunding          = myProjects.length > 0
    ? Math.round(myProjects.reduce((s,p) =>
        s + (p.price > 0 ? Math.min((getProjectRaised(p._id)/p.price)*100, 100) : 0), 0
      ) / myProjects.length)
    : 0;
  const totalExpectedProfit = myProjects.reduce((s,p) => s + (Number(p.expectedProfit)||0), 0);

const handleDeleteProject = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this project?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete project");

    setProjects((prev) => prev.filter((p) => p._id !== id));

  } catch (err) {
    console.error("Delete error:", err);
  }
};
  return (
    <div className="inv-dash">

      {/* HEADER */}
      <header className="inv-header">
        <div className="header-row">
          <div className="header-brand">
           
            <div>
              <div className="header-title">Inventor Studio</div>
              <div className="header-sub">Welcome back, {currentUser?.name || "Inventor"}</div>
            </div>
          </div>
          <div className="header-actions">
            <span className="header-badge">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
            {role === "inventor" && (
              <button className="add-proj-btn"
                onClick={() => { setEditingProject(null); setShowAddForm((v) => !v); }}>
                {showAddForm ? "✕ Close" : "➕ New Project"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* METRICS */}
      <div className="metrics-row">
        <div className="metric-card gold">
          <div className="metric-label">Total Raised</div>
          <div className="metric-value" ref={(el) => { metricsRef.current[0] = el; }}
            data-target={totalRaised} data-prefix="" data-suffix=" ETB">0 ETB</div>
          <div className="metric-sub">from {myProjects.length} projects</div>
          <div className="metric-accent"></div>
        </div>
        <div className="metric-card teal">
          <div className="metric-label">Projects</div>
          <div className="metric-value" ref={(el) => { metricsRef.current[1] = el; }}
            data-target={myProjects.length} data-prefix="" data-suffix="">0</div>
          <div className="metric-sub">{approvedCount} approved</div>
          <div className="metric-accent"></div>
        </div>
        <div className="metric-card blue">
          <div className="metric-label">Avg Funding</div>
          <div className="metric-value" ref={(el) => { metricsRef.current[2] = el; }}
            data-target={avgFunding} data-prefix="" data-suffix="%">0%</div>
          <div className="metric-sub">across projects</div>
          <div className="metric-accent"></div>
        </div>
        <div className="metric-card coral">
          <div className="metric-label">Expected Profit</div>
          <div className="metric-value" ref={(el) => { metricsRef.current[3] = el; }}
            data-target={totalExpectedProfit}  data-suffix=" ETB">0 ETB</div>
          <div className="metric-sub">combined estimate in 3 Months</div>
          <div className="metric-accent"></div>
        </div>
      </div>

      {/* ADD / EDIT OVERLAY */}
      {showAddForm && (
        <div className="form-overlay">
          <AddProject
            project={editingProject}
            currentUser={currentUser}
            onProjectSaved={handleProjectSaved}
            onCancel={() => { setShowAddForm(false); setEditingProject(null); }}
          />
        </div>
      )}

      {/* MAIN BODY */}
      <div className="dash-body">

        {/* LEFT — charts */}
        <div className="dash-col">
          <ChartsPanel projects={projects} payments={payments} currentUser={currentUser} role={role} />
        </div>

        {/* RIGHT — admin queue + criteria */}
        <div className="dash-col">
          {role === "admin" && (
            <div className="section-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-title-dot dot-coral"></span>Pending Approval
                </div>
                <span className="pending-count">
                  {visibleProjects.filter((p) => p.status === "Pending").length}
                </span>
              </div>
              {visibleProjects.filter((p) => p.status === "Pending").length === 0 ? (
                <p className="empty-state">No pending projects. 🎉</p>
              ) : (
                <ul className="pending-list">
                  {visibleProjects.filter((p) => p.status === "Pending").map((p) => (
                    <li key={p._id} className="pending-item">
                      <div>
                        <div className="pending-title">{p.title}</div>
                        <div className="pending-profit">Expected: {p.expectedProfit}ETB</div>
                      </div>
                      <div className="pending-actions">
                        <button className="approve-btn" onClick={() => handleProjectStatusChange(p._id,"Approved")}>✅ Approve</button>
                        <button className="reject-btn"  onClick={() => handleProjectStatusChange(p._id,"Rejected")}>❌ Reject</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <ApprovalCriteria />
        </div>

        {/* PROJECTS GRID */}
        <div className="projects-section">
          <div className="section-card">
            <div className="card-header">
              <div className="card-title">
                <span className="card-title-dot dot-purple"></span>
                {role === "admin" ? "All Projects" : "My Projects"}
              </div>
              <span className="project-count">{visibleProjects.length} total</span>
            </div>
            {visibleProjects.length === 0 ? (
              <div className="empty-state-large">
                <div className="empty-icon">💡</div>
                <p>No projects yet. Add your first invention!</p>
              </div>
            ) : (
              <div className="projects-grid">
                {visibleProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    role={role}
                    currentUser={currentUser}
                    payments={payments}
                    onEdit={(p) => { setEditingProject(p); setShowAddForm(true); }}
                    onStatusChange={handleProjectStatusChange}
                     onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default InventorDashboard;