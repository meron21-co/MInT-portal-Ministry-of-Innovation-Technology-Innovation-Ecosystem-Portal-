import React, { useState, useEffect } from "react";
// import your CSS

const categories = [
  "Health",
  "Education",
  "Agriculture",
  "Energy",
  "Finance",
  "Software Solutions",
  "Manufacturing",
  "Transport",
  "Tourism",
  "Social",
  "Other"
];

// Updated mock projects with videoUrl and images
const mockProjects = {
  Health: [
    {
      id: 1,
      name: "Health Tracker",
      description: "Wearable health device",
      investors: ["Dave"],
      amountRaised: 7000,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      images: [
        "https://via.placeholder.com/150?text=Health+Image+1",
        "https://via.placeholder.com/150?text=Health+Image+2"
      ]
    },
  ],
  Education: [
    {
      id: 2,
      name: "Digital Learning Platform",
      description: "STEM education tools",
      investors: ["Eve"],
      amountRaised: 4000,
      videoUrl: "",
      images: ["https://via.placeholder.com/150?text=Education+Image+1"]
    },
  ],
  Agriculture: [
    {
      id: 3,
      name: "Smart Farm",
      description: "Precision agriculture system",
      investors: ["Frank"],
      amountRaised: 6500,
      videoUrl: "",
      images: []
    },
  ],
  // ... (rest similar, you can add videoUrl/images as needed)
  Energy: [
    {
      id: 4,
      name: "Solar Energy Solution",
      description: "Renewable energy tech",
      investors: ["Grace"],
      amountRaised: 8000,
      videoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
      images: ["https://via.placeholder.com/150?text=Energy+Image+1"]
    },
  ],
  Finance: [
    {
      id: 5,
      name: "FinTech Mobile App",
      description: "Mobile banking solution",
      investors: ["Hank"],
      amountRaised: 4500,
      videoUrl: "",
      images: []
    },
  ],
  "Software Solutions": [
    {
      id: 6,
      name: "AI SaaS Tool",
      description: "Cloud-based AI services",
      investors: ["Ivy"],
      amountRaised: 7200,
      videoUrl: "",
      images: []
    },
  ],
  Manufacturing: [
    {
      id: 7,
      name: "Robotics Automation",
      description: "Industry 4.0 robotics",
      investors: ["John"],
      amountRaised: 9000,
      videoUrl: "",
      images: []
    },
  ],
  Transport: [
    {
      id: 8,
      name: "EV Charging Network",
      description: "Electric vehicle infrastructure",
      investors: ["Karen"],
      amountRaised: 5600,
      videoUrl: "",
      images: []
    },
  ],
  Tourism: [
    {
      id: 9,
      name: "Travel Experience Platform",
      description: "Digital tourism services",
      investors: ["Leo"],
      amountRaised: 3500,
      videoUrl: "",
      images: []
    },
  ],
  Social: [
    {
      id: 10,
      name: "Community Engagement App",
      description: "Social inclusion tech",
      investors: ["Mia"],
      amountRaised: 4200,
      videoUrl: "",
      images: []
    },
  ],
  Other: [
    {
      id: 11,
      name: "Smart City Initiative",
      description: "Urban innovation projects",
      investors: ["Nick"],
      amountRaised: 6000,
      videoUrl: "",
      images: []
    },
  ],
};

function InvestorDashboard() {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    setCategoryList(categories);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setProjects(mockProjects[selectedCategory] || []);
      setSelectedProject(null);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category) => setSelectedCategory(category);
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setPaymentAmount("");
  };

  const handlePayment = () => {
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    alert(`Payment of $${paymentAmount} made to project "${selectedProject.name}"!`);

    setProjects((prevProjects) =>
      prevProjects.map((proj) =>
        proj.id === selectedProject.id
          ? { ...proj, amountRaised: proj.amountRaised + Number(paymentAmount), investors: [...proj.investors, "You"] }
          : proj
      )
    );

    setSelectedProject((prev) => ({
      ...prev,
      amountRaised: prev.amountRaised + Number(paymentAmount),
      investors: [...prev.investors, "You"],
    }));

    setPaymentAmount("");
  };

  return (
    <div className="investor-dashboard-container">
      <h1 className="investor-dashboard-title">Investor Dashboard</h1>

      {/* Categories */}
      <div className="investor-dashboard-categories-wrapper">
        <h2 className="investor-dashboard-subtitle">Project Categories</h2>
        <div className="investor-dashboard-categories">
          {categoryList.map((cat) => (
            <button
              key={cat}
              className={`investor-dashboard-category-btn ${
                cat === selectedCategory ? "active" : ""
              }`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects list */}
      {selectedCategory && (
        <div className="investor-dashboard-projects-wrapper">
          <h2 className="investor-dashboard-subtitle">
            Projects in "{selectedCategory}"
          </h2>
          {projects.length === 0 && (
            <p className="investor-dashboard-no-projects">No projects found in this category.</p>
          )}
          <ul className="investor-dashboard-projects-list">
            {projects.map((project) => (
              <li
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className={`investor-dashboard-project-item ${
                  selectedProject?.id === project.id ? "selected" : ""
                }`}
              >
                <strong className="investor-dashboard-project-name">{project.name}</strong> -{" "}
                <span className="investor-dashboard-project-description">{project.description}</span>
                <br />
                <small className="investor-dashboard-project-raised">
                  Raised: ${project.amountRaised}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected project details + payment */}
      {selectedProject && (
        <div className="investor-dashboard-payment-wrapper">
          <h2 className="investor-dashboard-subtitle">
            Invest in "{selectedProject.name}"
          </h2>
          <p className="investor-dashboard-project-description">
            {selectedProject.description}
          </p>

          {/* Show video if present */}
          {selectedProject.videoUrl && (
            <div style={{ margin: "20px 0" }}>
              <iframe
                width="100%"
                height="315"
                src={selectedProject.videoUrl}
                title="Project Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Show images if present */}
          {selectedProject.images && selectedProject.images.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {selectedProject.images.map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`${selectedProject.name} screenshot ${index + 1}`}
                  style={{
                    width: "150px",
                    height: "auto",
                    borderRadius: "5px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                />
              ))}
            </div>
          )}

          <p>
            <strong>Amount Raised: </strong>${selectedProject.amountRaised}
          </p>
          <p>
            <strong>Investors: </strong> {selectedProject.investors.join(", ")}
          </p>

          <div className="investor-dashboard-payment-form">
            <label>
              Enter payment amount:{" "}
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="investor-dashboard-payment-input"
                min="1"
              />
            </label>
            <button onClick={handlePayment} className="investor-dashboard-pay-btn">
              Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestorDashboard;
