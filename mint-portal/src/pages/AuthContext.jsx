import { createContext, useState } from "react";
import { useEffect } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Load user from localStorage safely
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");


  
useEffect(() => {
  const loadUser = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.log(err);
    }
  };

  loadUser();
}, [token]);




  // Login
  const login = (userData, tokenData, saveToStorage = true) => {
    setUser(userData);
    setToken(tokenData);

    if (saveToStorage) {
      try {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
      } catch (error) {
        console.error("Failed to save user/token to localStorage:", error);
      }
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // -----------------------------
  // ⭐ UPDATE PROFILE IMAGE
  // -----------------------------
  const updateProfileImage = async (formData) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/upload-profile", {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) return alert("Image upload failed");

      // Create updated user object
     const updatedUser = data.user;

setUser(updatedUser);
localStorage.setItem("user", JSON.stringify(updatedUser));


      // Update state & localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  // -----------------------------
  // ⭐ REMOVE PROFILE IMAGE
  // -----------------------------
  const removeProfileImage = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/remove-image", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) return alert("Failed to remove image");

      // Create updated user object
      const updatedUser = { ...user, profile: "" };

      // Update state & localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (error) {
      console.error("Remove image error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
     setUser,
      login,
      logout,
      updateProfileImage,
      removeProfileImage
    }}>
      {children}
    </AuthContext.Provider>
  );
};
