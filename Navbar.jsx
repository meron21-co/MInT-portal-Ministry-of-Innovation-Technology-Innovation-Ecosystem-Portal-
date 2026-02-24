import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './component.css';
import { HashLink } from 'react-router-hash-link';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="footer-logo">
        <div className="icon-box">💡</div>
      </div>

     <h1 className="navbar-logo">
  <Link to="/">
    <span className="logo-mint">MINT</span>
    <span className="logo-portal">PORTAL</span>
  </Link>
</h1>


      {/* Hamburger Icon for Mobile */}
      <div className="menu-toggle" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Menu Links */}
      <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
        <li className="nav-item">
          <HashLink smooth to="/#home" className="nav-links" onClick={() => setMenuOpen(false)}>
            Home
          </HashLink>
        </li>

        <li className="nav-item">
          <HashLink smooth to="/#dashboard" className="nav-links" onClick={() => setMenuOpen(false)}>
            Dashboard
          </HashLink>
        </li>

 <li className="nav-item">
          <HashLink smooth to="/#about-us" className="nav-links" onClick={() => setMenuOpen(false)}>
           About-Us
          </HashLink>
        </li>


        <li className="nav-item">
          <Link to="/footer" className="nav-links" onClick={() => setMenuOpen(false)}>
            Contact-Us
          </Link>
        </li>

        {/* Buttons */}
        <ul className="nav-buttons">
          <li className="nav-item">
            <Link to="/login" className="nav-links" onClick={() => setMenuOpen(false)}>
              <button className="btn-log">Login</button>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-links" onClick={() => setMenuOpen(false)}>
              <button className="btn-register">Register</button>
            </Link>
          </li>
        </ul>
      </ul>
    </nav>
  );
};

export default Navbar;
