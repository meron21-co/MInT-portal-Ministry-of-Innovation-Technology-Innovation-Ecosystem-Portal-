import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function InventorDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "inventor") {
      navigate("/login");
    }

    fetch("/api/projects/mine")
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err));
  }, [navigate]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Inventor Dashboard</h1>
      </header>
    {/* Add New Project Button */}
          <div className="add-project-container">
            <button
              className="add-btn"
              onClick={() => navigate("/add-project")}
            >
              ➕ Add New Project
            </button>
          </div>
      <section className="projects-section">
        <h2>My Projects</h2>
        {projects.length === 0 ? (
          <p className="empty">No projects yet. Start by adding one!</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <article key={project.id} className="project-card">
                <img
                  src={project.image || "https://via.placeholder.com/300"}
                  alt={project.title}
                  className="project-image"
                />
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>

                  {project.video && (
                    <video controls className="project-video">
                      <source src={project.video} type="video/mp4" />
                      Your browser does not support video.
                    </video>
                  )}

                  <div className="project-actions">
                    <button
                      className={`favorite-btn ${favorites.includes(project.id) ? "favorited" : ""}`}
                      onClick={() => toggleFavorite(project.id)}
                    >
                      ⭐ {favorites.includes(project.id) ? "Unfavorite" : "Favorite"}
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="questions-section">
        <h2>Questions About My Projects</h2>
        <div className="questions-list">
          <p className="empty">No questions yet.</p>
        </div>
      </section>


    </div>
  );
}

export default InventorDashboard;
