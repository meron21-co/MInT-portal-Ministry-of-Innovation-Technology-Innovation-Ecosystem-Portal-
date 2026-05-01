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
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
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
  const file = e.target.files[0];
  if (!file) return;

  // 1️⃣ Instant preview
  const previewURL = URL.createObjectURL(file);
  setUser(prev => ({ ...prev, profile: previewURL }));

  try {
    // 2️⃣ Upload
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/api/users/profile-image`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    // 3️⃣ Update profile with server URL
    setUser(prev => ({
      ...prev,
      profile: `${API_URL}${data.profile}?t=${Date.now()}`, // force reload
    }));

  } catch (err) {
    console.error(err);
    alert("Image upload error");
  } finally {
    // 4️⃣ cleanup
    URL.revokeObjectURL(previewURL);
  }
};

  const handleNameChange = (newName) => setUser(prev => ({ ...prev, name: newName }));
  const handleEmailChange = (newEmail) => setUser(prev => ({ ...prev, email: newEmail }));

  const getDisplayName = () => user?.name
    ? user.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    : "User";

  const getRoleLabel = () => user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";

const isLoggedIn = !!user;
const role = user?.role;

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

  {/* 🔹 ONLY for NOT logged-in users */}
  {!user && (
    <>
      <li className="nav-item">
        <HashLink smooth to="/#home" className="nav-links" onClick={() => setMenuOpen(false)}>Home</HashLink>
      </li>
      <li className="nav-item">
        <HashLink smooth to="/#about-us" className="nav-links" onClick={() => setMenuOpen(false)}>About Us</HashLink>
      </li>
      <li className="nav-item">
        <HashLink smooth to="/#footer" className="nav-links" onClick={() => setMenuOpen(false)}>Contact</HashLink>
      </li>

      <li className="nav-item">
        <Link to="/login"><button className="btn-log">Login</button></Link>
      </li>
      <li className="nav-item">
        <Link to="/register"><button className="btn-register">Register</button></Link>
      </li>
    </>
  )}

  {/* 🔹 ONLY PROFILE when logged in */}
  {user && (
    <li className="nav-item profile-container">
      <div className="profile-box" onClick={() => setSettingsOpen(prev => !prev)}>
        <img
          src={
            user.profile
              ? user.profile.startsWith("blob:") || user.profile.startsWith("http")
                ? user.profile
                : `${API_URL}${user.profile}?t=${Date.now()}`
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          className="profile-img"
        />

        <div className="profile-text">
          <span className="profile-name">{getDisplayName()}</span>
          <span className="profile-role">{getRoleLabel()}</span>
        </div>

        <span className="profile-arrow">⌄</span>
      </div>

      {settingsOpen && (
        <div className="profile-panel">
          <div className="profile-panel-header">
            <img
              src={
                user.profile
                  ? user.profile.startsWith("blob:") || user.profile.startsWith("http")
                    ? user.profile
                    : `${API_URL}${user.profile}?t=${Date.now()}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="profile-img-preview"
            />

            <div>
              <h4>{getDisplayName()}</h4>
              <span>{getRoleLabel()}</span>
            </div>
          </div>

          <label className="upload-btn">
            Change Photo
            <input type="file" accept="image/*" onChange={handleProfileUpload} hidden />
          </label>

          <input
            type="text"
            value={user.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <input
            type="email"
            value={user.email || ""}
            onChange={(e) => handleEmailChange(e.target.value)}
          />

          <button className="btn-save" onClick={saveSettingsAndClose}>
            💾 Save Changes
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
      )}
    </li>
  )}

</ul>

  
   


    </nav>
  );
};

export default Navbar;
