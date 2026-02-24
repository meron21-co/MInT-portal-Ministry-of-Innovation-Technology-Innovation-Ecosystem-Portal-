import React, { useState } from "react";
import './index.css';
import image4 from './image/image4.jpg';
import { FaMapMarkerAlt, FaHeartbeat,        // Health
  FaGraduationCap,    // Education
  FaTractor,          // Agriculture
  FaSolarPanel,       // Energy
  FaMoneyBillWave,    // Finance
  FaLaptopCode,       // Software Solutions
  FaIndustry,         // Manufacturing
  FaBus,              // Transport
  FaUmbrellaBeach,    // Tourism
  FaHandshake ,        // Social 
  FaEllipsisH,        // Other
   } from "react-icons/fa";

 function HomePage() {
   const [showModal, setShowModal] = useState(false); 
  return (
    <div className="home-container">
      {/* --- Header --- */}
      <div id="home" className="home">
        <header className="header">
          <h1>Welcome to the MInT Innovation Portal</h1>
          <h2>Empowering Ethiopia’s Innovation Ecosystem</h2>
          <p>
            Discover a dynamic hub where bold ideas meet opportunity. The Ministry of Innovation and Technology (MInT) portal connects visionary innovators, researchers, and startups with strategic investors, mentors, and partners. Together, we are shaping a technology-driven future for Ethiopia — one breakthrough at a time.
          </p>
         <div class="button-group">
            <button class="btn-start"><a href="/register" >Get Started →</a> </button>
            <button class="btn-login"> <a href="/login">Login</a></button>
          </div>

        </header>
      </div>

      <div className="dashboard">
        {/* --- Cards --- */}
        <section id="dashboard"  className="cards-section">
          <div className="cards-header">
            <h1>Your Role in Building Ethiopia’s Future</h1>
            <p>
              Whether you’re an <strong>innovator</strong>, <strong>investor</strong>, or <strong>administrator</strong>, 
              take action today to shape the country’s technology and innovation landscape.
            </p>
          </div>
        </section>

        <div className="cards-container">
          {/* --- Innovators Card --- */}
          <div className="card">
            <div className="card-title">
              <div className="icon-box">💡</div>
              <h2>Innovators</h2>
            </div>
            <p>Showcase your groundbreaking ideas, connect with mentors, and secure funding for your Ethiopian innovation.</p>
            <ul>
              <li>Submit and manage project proposals</li>
              <li>Track funding progress and milestones</li>
              <li>Connect with industry mentors</li>
              <li>Access government support programs</li>
            </ul>
             <button className="card-button">
        <a href="/Register" style={{ color: "inherit", textDecoration: "none" }}>
        Start your journey
        </a>
      </button>
          </div>



          {/* --- Investors Card --- */}
          <div className="card">
            <div className="investors-header">
              <span className="dollar-icon">$</span>
              <h2>Investors & Partners</h2>
            </div>
            <p>Discover promising Ethiopian startups and innovative projects that align with your investment goals.</p>
            <ul>
              <li>Browse verified innovation projects</li>
              <li>Filter by sector, stage, and funding needs</li>
              <li>Direct communication with founders</li>
              <li>Track portfolio performance</li>
            </ul>
   
          <button className="card-button">
        <a href="/Register" style={{ color: "inherit", textDecoration: "none" }}>
          Explore Opportunities
        </a>
      </button>

          </div>

          {/* --- Admins Card --- */}
          <div className="card">
            <div className="section-header">
              <span className="admin-icon">⚙️</span>
              <h2>Admins</h2>
            </div>
            <p>Monitor ecosystem growth, approve projects, and drive Ethiopia's innovation and technology development.</p>
            <ul>
              <li>Review and approve project submissions</li>
              <li>Access comprehensive ecosystem analytics</li>
              <li>Manage support programs and initiatives</li>
              <li>Generate impact and progress reports</li>
            </ul>
            <button className="card-button">
          <a href="/login" style={{ color: "inherit", textDecoration: "none" }}>
            Admin Dashboard
          </a>
        </button>
          </div>
        </div>

        {/* --- Innovation Categories --- */}
        <section className="categories-section">
      <h2>🌟 Innovation Categories</h2>
      <div className="categories-grid">

        {/* 1. Health */}
        <div className="category-card">
          <FaHeartbeat size={60} color="#e63946" />
          <h3>Health</h3>
          <p>Innovations in healthcare, telemedicine, biotech, and medical devices to improve quality of life.</p>
        </div>

        {/* 2. Education */}
        <div className="category-card">
          <FaGraduationCap size={60} color="#4361ee" />
          <h3>Education</h3>
          <p>Digital learning, STEM tools, and platforms that transform how people access and share knowledge.</p>
        </div>

        {/* 3. Agriculture */}
        <div className="category-card">
          <FaTractor size={60} color="#2a9d8f" />
          <h3>Agriculture</h3>
          <p>Smart farming, precision agriculture, and food technology for better yields and sustainability.</p>
        </div>

        {/* 4. Energy */}
        <div className="category-card">
          <FaSolarPanel size={60} color="#ffb703" />
          <h3>Energy</h3>
          <p>Renewable energy, clean tech, and innovations tackling climate change and energy access.</p>
        </div>

        {/* 5. Finance */}
        <div className="category-card">
          <FaMoneyBillWave size={60} color="#06d6a0" />
          <h3>Finance</h3>
          <p>FinTech, mobile banking, payment systems, and microfinance solutions for financial inclusion.</p>
        </div>

        {/* 6. Software Solutions */}
        <div className="category-card">
          <FaLaptopCode size={60} color="#3a86ff" />
          <h3>Software Solutions</h3>
          <p>Apps, cloud services, AI tools, and secure software systems for every sector.</p>
        </div>

        {/* 7. Manufacturing */}
        <div className="category-card">
          <FaIndustry size={60} color="#8338ec" />
          <h3>Manufacturing</h3>
          <p>Robotics, 3D printing, and automation innovations driving Industry 4.0 growth.</p>
        </div>

        {/* 8. Transport */}
        <div className="category-card">
          <FaBus size={60} color="#f77f00" />
          <h3>Transport</h3>
          <p>Electric vehicles, logistics platforms, and smart traffic systems for the future of mobility.</p>
        </div>

        {/* 9. Tourism */}
        <div className="category-card">
          <FaUmbrellaBeach size={60} color="#ff006e" />
          <h3>Tourism</h3>
          <p>Digital tourism, heritage tech, and platforms that promote culture and travel experiences.</p>
        </div>

        {/* 10. Social */}
        <div className="category-card">
          <FaHandshake size={60} color="#118ab2" />
          <h3>Social</h3>
          <p>Innovations for inclusion, accessibility, and stronger community engagement.</p>
        </div>
       {/* 11. Other */}
<div className="category-card">
  <FaEllipsisH size={60} color="#6c757d" />
  <h3>Other</h3>
  <p>
    Includes Space & Astronomy, Smart Cities, Creative Industries, Policy & Governance innovations, and more.
  </p>
</div>



      </div>
    </section>


 <section id="about-us" className="about-section">
      <h2 className="about-title">About Mint Portal</h2>

      <div className="about-container">
        <div className="about-image-container">
         
      <img src={image4} alt="Innovation" className="about-image" />
        </div>

        <div className="about-text-container">
          <p className="about-paragraph">
            Mint Portal is your gateway to innovation, creativity, and
            collaboration. We empower inventors, innovators, and
            administrators to connect, share ideas, and build a brighter future
            together.
          </p>

          <p className="about-paragraph">
            Our platform supports seamless project showcasing, funding
            opportunities, and community engagement — all designed to help you
            bring your groundbreaking ideas to life.
          </p>

           <button className="learn-more-button" onClick={() => setShowModal(true)}>
        Learn More
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h2 id="modal-title">Welcome to Mint Portal!</h2>
            <p>
              We connect inventors, innovators, and administrators to bring
              ideas to life. Whether you want to showcase your invention,
              collaborate with others, or find funding, Mint Portal is your
              platform for success.
            </p>

            <h3>Features:</h3>
            <ul>
              <li>Project Showcase with images & videos</li>
              <li>Community Collaboration & Messaging</li>
              <li>Funding & Investment Opportunities</li>
              <li>Events & Workshops</li>
            </ul>

            <h3>How to Get Started:</h3>
            <ol>
              <li>Register and create your profile.</li>
              <li>Submit your project details and media.</li>
              <li>Connect with investors or collaborators.</li>
              <li>Track progress and get feedback.</li>
            </ol>

            <h3>Success Stories:</h3>
            <blockquote>
              “Thanks to Mint Portal, my invention got the attention of top
              investors!” – Amina
            </blockquote>

            <button
              className="close-button"
              onClick={() => setShowModal(false)}
              aria-label="Close Learn More modal"
            >
              Close
            </button>
          </div>
        </div>
          )}
        </div>
      </div>
    </section>

    
     <div className="hero-section">
      <h1>🌍 Your Ideas Can Ignite a New Era for Ethiopia!</h1>
      <p>
        Be part of a powerful movement driving innovation, empowering startups,
        and redefining technology for Ethiopia and beyond.
      </p>
      <button className="hero-button">
        <a href="/register" >🚀 Begin Your Impact Today →</a>
      </button>
    </div>


      </div>
    </div>
  );
}

export default HomePage;
