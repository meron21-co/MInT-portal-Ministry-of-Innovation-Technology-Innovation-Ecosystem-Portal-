import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import "./component.css";
import { AuthContext } from "../pages/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false); // Settings panel toggle
  const { user, setUser, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);
const saveSettingsAndClose = () => {
  // Here you could also call an API to save changes permanently if needed
  setSettingsOpen(false); // Close the settings panel
};

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSettings = () => setSettingsOpen(!settingsOpen);

  useEffect(() => {
    if (!user) setSettingsOpen(false);
  }, [user]);

  const dashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "inventor") return "/inventor";
    if (user.role === "investor") return "/investor";
    return "/login";
  };

  // const handleProfileUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setUser(prev => ({
  //     ...prev,
  //     profile: URL.createObjectURL(file),
  //   }));

  //   const formData = new FormData();
  //   formData.append("image", file);
  //   updateProfileImage(formData);
  // };

 const handleProfileUpload = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;

    // preview image
    const previewURL = URL.createObjectURL(file);

    setUser(prev => ({
      ...prev,
      profile: previewURL,
    }));

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      "http://localhost:5000/api/users/profile-image",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok) {
      setUser(prev => ({
        ...prev,
        profile: "http://localhost:5000" + data.profile + "?t=" + Date.now()
      }));

      // cleanup preview memory
      URL.revokeObjectURL(previewURL);
    } else {
      alert(data.message || "Upload failed");
    }

  } catch (err) {
    console.error(err);
    alert("Image upload error");
  }
};


  const handleNameChange = (newName) => setUser(prev => ({ ...prev, name: newName }));
  const handleEmailChange = (newEmail) => setUser(prev => ({ ...prev, email: newEmail }));

  const getDisplayName = () => user?.name
    ? user.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    : "User";

  const getRoleLabel = () => user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="icon-box">💡</div>
      <h1 className="navbar-logo">
        <Link to="/" onClick={() => setMenuOpen(false)}>
         
          <span className="logo-mint">MInT</span>
          <span className="logo-portal">PORTAL</span>
        </Link>
      </h1>

      {/* Hamburger for mobile */}
      <div className={`menu-toggle ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Nav Menu */}
      <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
        <li className="nav-item">
          <HashLink smooth to="/#home" className="nav-links" onClick={() => setMenuOpen(false)}>Home</HashLink>
        </li>
        <li className="nav-item">
          <Link to={dashboardLink()} className="nav-links" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        </li>
        <li className="nav-item">
          <HashLink smooth to="/#about-us" className="nav-links" onClick={() => setMenuOpen(false)}>About Us</HashLink>
        </li>
        <li className="nav-item">
          <HashLink smooth to="/#footer" className="nav-links" onClick={() => setMenuOpen(false)}>Contact</HashLink>
        </li>

        {/* Login/Register or Settings */}
        {!user ? (
          <>
            <li className="nav-item">
              <Link to="/login"><button className="btn-log">Login</button></Link>
            </li>
            <li className="nav-item">
              <Link to="/register"><button className="btn-register">Register</button></Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              {/* Settings Button */}
              <button className="btn-settings" onClick={toggleSettings}>
                ⚙️ Settings
              </button>
            </li>
            <li className="nav-item profile-container">
              {/* Minimal Profile Box */}
              <div className="profile-box">
               <img
  src={
    user.profile
      ? user.profile.startsWith("blob:")
        ? user.profile
        : "http://localhost:5000" + user.profile + "?t=" + Date.now()
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  }
  alt="Profile"
  className="profile-img"
/>
                <div className="profile-text">
                  <span className="profile-name">{getDisplayName()}</span>
                  <span className="profile-role">{getRoleLabel()}</span>
                </div>
              </div>
            </li>
          </>
        )}
      </ul>

      {/* Settings Dropdown Panel */}
    {settingsOpen && user && (
  <div className="settings-panel">
    {/* Profile Preview */}
    <div className="settings-profile">
      <div className="profile-img-box">
        <img
  src={
    user.profile
      ? user.profile.startsWith("blob:")
        ? user.profile
        : "http://localhost:5000" + user.profile + "?t=" + Date.now()
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  }
  alt="Profile"
  className="profile-img-preview"
/>
        <label htmlFor="profile-upload" className="profile-upload-btn">
          Change Photo
        </label>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleProfileUpload}
          hidden
        />
      </div>
      <div className="profile-name-role">
        <h4>{getDisplayName()}</h4>
        <span>{getRoleLabel()}</span>
      </div>
    </div>

    {/* Editable Fields */}
    <div className="settings-fields">
      <div className="settings-item">
        <label>Name</label>
        <input
          type="text"
          value={user.name}
          onChange={e => handleNameChange(e.target.value)}
        />
      </div>

      <div className="settings-item">
        <label>Email</label>
        <input
          type="email"
          value={user.email || ""}
          onChange={e => handleEmailChange(e.target.value)}
        />
      </div>
    </div>

    {/* Theme & Logout */}
    <div className="settings-actions">
      <button className="btn-theme" onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
     
    {/* Save & Close Button */}
  <button className="btn-theme" onClick={saveSettingsAndClose}>
    💾 Save & Close
  </button>
      <button
        className="btn-logout"
        onClick={() => {
          logout();
          setSettingsOpen(false);
        }}
      >
        Logout
      </button>
    </div>
  </div>
)}


    </nav>
  );
};

export default Navbar;
