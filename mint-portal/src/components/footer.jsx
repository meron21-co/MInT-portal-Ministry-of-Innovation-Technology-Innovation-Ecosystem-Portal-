// src/components/Footer.js
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaTwitter, FaLinkedin, FaFacebookF } from "react-icons/fa";
import './component.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* 🔹 LEFT SECTION (Logo & Description) */}
        <div className="footer-left">
          <div className="footer-logo">
            <div className="icon-boxs">💡</div>
            <div>
              <h2>MInT Innovation Portal</h2>
              <p>Ministry of Innovation and Technology</p>
            </div>
          </div>
          
          <p className="footer-text">
            Empowering Ethiopia's innovation ecosystem by connecting visionary innovators 
            with strategic investors and government support.
          </p>
        </div>

        {/* 🔹 CENTER SECTION (Quick Links) */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/register">Register</a></li>
            <li><a href="/login">Sign In</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>

        {/* 🔹 RIGHT SECTION (Contact Info instead of Resources) */}
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p><FaMapMarkerAlt /> Addis Ababa, Ethiopia</p>
          <p><FaPhoneAlt /> +251 11 XXX XXXX</p>
          <p><FaEnvelope /> info@mint.gov.et</p>
        </div>
      </div>

      {/* 🔹 BOTTOM BAR */}
      <div className="footer-bottom">
        <p>© 2024 Ministry of Innovation and Technology, Ethiopia. All rights reserved.</p>
        <div className="social-icons">
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaLinkedin /></a>
          <a href="#"><FaFacebookF /></a>
        </div>
      </div>
    </footer>
  );
}
