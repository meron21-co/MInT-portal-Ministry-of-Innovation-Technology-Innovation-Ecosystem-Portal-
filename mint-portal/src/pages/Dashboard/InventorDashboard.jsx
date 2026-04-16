import React, { useState, useEffect } from "react";
import "./Dashboard.css";

// ---------- Question Card ----------
function QuestionCard({ question, onAnswerUpdated }) {
  const [answer, setAnswer] = useState(question.answer?.text || "");
  const [resolved, setResolved] = useState(question.answer?.resolved || false);
  const [highlight, setHighlight] = useState(question.answer?.highlight || false);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    const updatedAnswer = { text: answer, resolved, highlight };
    await onAnswerUpdated(question._id, updatedAnswer);
  };

  return (
    <div className={`question-card ${highlight ? "highlighted" : ""}`}>
      <p className="question-text">{question.text}</p>
      <form onSubmit={handleAnswerSubmit} className="answer-form">
        <textarea
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="answer-options">
          <label>
            <input
              type="checkbox"
              checked={resolved}
              onChange={(e) => setResolved(e.target.checked)}
            />{" "}
            Mark as Resolved
          </label>
          <label>
            <input
              type="checkbox"
              checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)}
            />{" "}
            Highlight
          </label>
        </div>
        <button type="submit">Save Answer</button>
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

// ---------- Questions List ----------
function QuestionsList({ questions, onAnswerUpdated }) {
  if (!Array.isArray(questions)) return null;
  return (
    <div className="questions-list">
      {questions.length > 0 ? (
        questions.map((q) => (
          <QuestionCard key={q._id} question={q} onAnswerUpdated={onAnswerUpdated} />
        ))
      ) : (
        <p className="empty">No questions yet.</p>
      )}
    </div>
  );
}

// ---------- Ask Question ----------
function AskQuestion({ projectId, onQuestionAdded }) {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onQuestionAdded(projectId, { text });
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="ask-question-form">
      <h4>Ask a Question</h4>
      <textarea
        placeholder="Type your question..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <button type="submit">Submit Question</button>
    </form>
  );
}

// ---------- Approval Criteria ----------
function ApprovalCriteria() {
  const criteriaDetails = [
    { title: "Clear Statement of Problem", description: "Identifies a real-world, measurable problem." },
    { title: "Feasible Solution / Approach", description: "Technically feasible and well-structured." },
    { title: "Expected Profit & Budget Realism", description: "Realistic expected profit and justified budget." },
    { title: "Project Description Completeness", description: "Objectives, methodology, timeline, challenges." },
    { title: "Innovativeness / Uniqueness", description: "Shows creativity or a novel solution." },
    { title: "Media & Documentation Quality", description: "Relevant images/videos and clear documentation." },
    { title: "Category Accuracy", description: "Correctly categorized according to predefined options." },
    { title: "Impact & Social Value", description: "Positive impact on community or environment." },
    { title: "Sustainability & Scalability", description: "Maintainable and scalable project." },
    { title: "Compliance & Ethics", description: "Adheres to legal, ethical, and safety standards." },
  ];

  return (
    <section className="criteria-section">
      <div className="criteria-card">
        <h2>Approval Criteria</h2>
        <ul className="criteria-list">
          {criteriaDetails.map((c, i) => (
            <li key={i}>
              <strong>{c.title}:</strong> {c.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------- Add / Edit Project ----------
function AddProject({ project, onProjectSaved, onCancel, currentUser }) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [price, setPrice] = useState(project?.price || "");
  const [problemStatement, setProblemStatement] = useState(project?.problemStatement || "");
  const [expectedProfit, setExpectedProfit] = useState(project?.expectedProfit || "");
  const [category, setCategory] = useState(project?.category || "Other");
  const [images, setImages] = useState(project?.images || []);
  const [videos, setVideos] = useState(project?.videos || []);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);

  const categories = [
    "Health", "Education", "Agriculture", "Energy", "Finance",
    "Software Solutions", "Manufacturing", "Transport", "Tourism", "Social", "Other"
  ];

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === "image") setNewImages(prev => [...prev, ...files]);
    else setNewVideos(prev => [...prev, ...files]);
  };

const removeFile = (index, type, existing = false) => {
  if (type === "image") {
    if (existing) {
      setImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  }

  if (type === "video") {
    if (existing) {
      setVideos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewVideos((prev) => prev.filter((_, i) => i !== index));
    }
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("User not logged in!");
      return;
    }

    const formData = new FormData();

    if (project?._id) formData.append("_id", project._id);

    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("problemStatement", problemStatement);
    formData.append("expectedProfit", expectedProfit);
    formData.append("category", category);

    formData.append("inventorName", currentUser.name || "Unknown");
    formData.append("inventorEmail", currentUser.email || "Unknown");

    newImages.forEach(file => formData.append("images", file));
    newVideos.forEach(file => formData.append("videos", file));
    images.forEach(url => formData.append("existingImages", url));
    videos.forEach(url => formData.append("existingVideos", url));

    onProjectSaved(formData, project?._id);
  };

  return (
    <div className="add-project">
      <h2>{project ? "Edit Project" : "Add New Project"}</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <input type="text" placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Project Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <textarea placeholder="Problem Statement" value={problemStatement} onChange={e => setProblemStatement(e.target.value)} required />
        <input type="number" placeholder="Project Price" value={price} onChange={e => setPrice(e.target.value)} min={0} />
        <input type="number" placeholder="Expected Profit" value={expectedProfit} onChange={e => setExpectedProfit(e.target.value)} min={0} />
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Upload Images</label>
        <input type="file" accept="image/*" multiple onChange={e => handleFileChange(e, "image")} />
        <div className="preview-container">
          {images.map((url, i) => (
            <div key={i} className="media-wrapper">
              <img src={url.startsWith("http") ? url : `http://localhost:5000${url}`} alt="preview" className="preview-img" />
              <button type="button" onClick={() => removeFile(i, "image", true)}>❌</button>
            </div>
          ))}
          {newImages.map((file, i) => (
            <div key={i} className="media-wrapper">
              <img src={URL.createObjectURL(file)} alt="preview" className="preview-img" />
              <button type="button" onClick={() => removeFile(i, "image")}>❌</button>
            </div>
          ))}
        </div>

        <label>Upload Videos</label>
        <input type="file" accept="video/*" multiple onChange={e => handleFileChange(e, "video")} />
        <div className="preview-container">
          {videos.map((url, i) => (
            <div key={i} className="media-wrapper">
              <video src={url.startsWith("http") ? url : `http://localhost:5000${url}`} controls className="preview-video" />
              <button type="button" onClick={() => removeFile(i, "video", true)}>❌</button>
            </div>
          ))}
          {newVideos.map((file, i) => (
            <div key={i} className="media-wrapper">
              <video src={URL.createObjectURL(file)} controls className="preview-video" />
              <button type="button" onClick={() => removeFile(i, "video")}>❌</button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit">{project ? "Save Changes" : "Save Project"}</button>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ---------- Inventor Dashboard ----------
function InventorDashboard({ role = "inventor" }) {
  const token = localStorage.getItem("token");

let currentUser;
try {
  const storedUser = localStorage.getItem("user");
  currentUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
} catch (err) {
  console.error("Failed to parse user:", err);
  currentUser = null;
}

  const [projects, setProjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
 

  useEffect(() => {
    if (!currentUser) {
      alert("Please login first!");
      window.location.href = "./login";
      return;
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleProjectSaved = async (formData, projectId) => {
    try {
      const url = projectId
        ? `http://localhost:5000/api/projects/${projectId}`
        : "http://localhost:5000/api/projects";
      const method = projectId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const updated = await res.json();
      setProjects(prev => projectId ? prev.map(p => (p._id === projectId ? updated : p)) : [...prev, updated]);
      setShowAddForm(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Error saving project:", err);
    }
  };

  const handleProjectStatusChange = async (id, status) => {
  try {
    let reason = "";
    if (status === "Rejected") {
      reason = prompt("Please enter a rejection reason:"); // 👈 Ask admin for reason
      if (!reason) return; // cancel if reason empty
    }

    const res = await fetch(`http://localhost:5000/api/projects/${id}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status, reason }), // ✅ send reason
    });

    const updated = await res.json();

    setProjects(prev =>
      prev.map(p => (p._id === id ? updated : p))
    );
  } catch (err) {
    console.error("Error updating status:", err);
  }
};


  const handleQuestionAdded = async (projectId, question) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/questions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(question),
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => (p._id === projectId ? updated : p)));
    } catch (err) {
      console.error("Error adding question:", err);
    }
  };

  const handleAnswerUpdated = async (questionId, answer) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/questions/${questionId}/answer`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(answer),
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => (p._id === updated._id ? updated : p)));
    } catch (err) {
      console.error("Error updating answer:", err);
    }
  };

  const visibleProjects = Array.isArray(projects)
    ? role === "inventor"
      ? projects.filter(p => p.inventorEmail === currentUser?.email)
      : projects
    : [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{role === "admin" ? "Admin Dashboard" : "Inventor Dashboard"}</h1>
        {role === "inventor" && <p>Welcome, {currentUser?.name || "Inventor"}! 💡</p>}

      </header>

      <ApprovalCriteria />

      {role === "inventor" && (
        <div className="add-project-container">
          <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            ➕ {showAddForm ? "Close Form" : "Add New Project"}
          </button>
          {showAddForm && (
            <AddProject
              project={editingProject}
              currentUser={currentUser}
              onProjectSaved={handleProjectSaved}
              onCancel={() => { setShowAddForm(false); setEditingProject(null); }}
            />
          )}
        </div>
      )}

      {role === "admin" && (
        <section className="criteria-section">
          <h2>Pending Projects</h2>
          {visibleProjects.filter(p => p.status === "Pending").length === 0
            ? <p>No pending projects.</p>
            : <ul>
                {visibleProjects.filter(p => p.status === "Pending").map(p => (
                  <li key={p._id}>
                    {p.title} - Expected Profit: ${p.expectedProfit}
                    <span className="approval-buttons">
                      <button onClick={() => handleProjectStatusChange(p._id, "Approved")}>✅ Approve</button>
                      <button onClick={() => handleProjectStatusChange(p._id, "Rejected")}>❌ Reject</button>
                    </span>
                  </li>
                ))}
              </ul>
          }
        </section>
      )}

      <section className="projects-section">
        <h2>{role === "admin" ? "All Projects" : "My Projects"}</h2>
        {visibleProjects.length === 0
          ? <p className="empty">No projects yet.</p>
          : <div className="projects-grid">
              {visibleProjects.map(project => (
                <article key={project._id} className="project-card">
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    {project.category && <span className="project-category">{project.category}</span>}
                    <p>{project.description}</p>
                    <p><strong>Problem Statement:</strong> {project.problemStatement}</p>
                    <p className="project-price">Price: ${project.price} | Expected Profit: ${project.expectedProfit}</p>
                                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status-text ${project.status.toLowerCase()}`}>
                      {project.status}
                    </span>

                    {project.status === "Rejected" && project.rejectionReason && (
                      <span className="rejection-reason">
                        — Reason: {project.rejectionReason}
                      </span>
                    )}
                  </p>


                    {/* Images */}
                    {Array.isArray(project.images) && project.images.length > 0 && (
                      <div className="media-gallery">
                        {project.images.map((img, i) => (
                          <img key={i} src={img.startsWith("http") ? img : `http://localhost:5000${img}`} alt="" className="project-image" />
                        ))}
                      </div>
                    )}

                    {/* Videos */}
                    {Array.isArray(project.videos) && project.videos.length > 0 && (
                      <div className="media-gallery">
                        {project.videos.map((vid, i) => (
                          <video key={i} src={vid.startsWith("http") ? vid : `http://localhost:5000${vid}`} controls className="project-video" />
                        ))}
                      </div>
                    )}

                    {role === "inventor" && project.inventorEmail === currentUser?.email && (
                      <>
                        <button
                         className="edit-btn" onClick={() => { setEditingProject(project); setShowAddForm(true); }}>✏️ Edit Project</button>

                         
                        <QuestionsList questions={project.questions || []} onAnswerUpdated={handleAnswerUpdated} />
                        <AskQuestion projectId={project._id} onQuestionAdded={handleQuestionAdded} />
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
        }
      </section>
    </div>
  );
}

export default InventorDashboard;
