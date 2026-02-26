import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";

const Profile = () => {
  const { user, updateProfileImage, removeProfileImage } = useContext(AuthContext);
  const [preview, setPreview] = useState(user?.profile || "");
  const [selectedFile, setSelectedFile] = useState(null);

  // Keep preview in sync if user.profile changes
  useEffect(() => {
    setPreview(user?.profile || "");
  }, [user]);

  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);
    setSelectedFile(file);
  };

  const handleSave = () => {
    if (!selectedFile) return alert("Select an image first");

    const formData = new FormData();
    formData.append("image", selectedFile); // 'image' matches your backend field name

    updateProfileImage(formData);
    setSelectedFile(null);
  };

  const handleRemove = async () => {
    await removeProfileImage(); // Call removeProfileImage from AuthContext
    setSelectedFile(null);
    setPreview(""); // Clear preview locally
  };

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>

      <img
        src={
          preview ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        className="profile-preview"
        alt="Profile preview"
        style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
      />

      <input
        type="file"
        accept="image/*"
        id="profileInput"
        style={{ display: "none" }}
        onChange={handleSelectImage}
      />

      <button onClick={() => document.getElementById("profileInput").click()}>
        Change Image
      </button>

      <button onClick={handleSave} disabled={!selectedFile}>
        Save Image
      </button>

      <button onClick={handleRemove}>
        Remove Image
      </button>
    </div>
  );
};

export default Profile;
