import express from "express";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profileDir = path.join(__dirname, "..", "uploads", "profiles");
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ FIX 1: Define adminOnly middleware here
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ----------------- Upload Profile Image -----------------
router.put(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image uploaded" });

      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.profile) {
        const oldPath = path.join(profileDir, path.basename(user.profile));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      user.profile = `/uploads/profiles/${req.file.filename}`;
      await user.save();

      res.json({ message: "Profile updated successfully", profile: user.profile, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ✅ FIX 2: All SPECIFIC routes must come BEFORE "/:id" routes

// ----------------- Get Pending Users -----------------
router.get("/pending", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({
      approvalStatus: "pending",
      role: { $ne: "admin" },
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Get Only Inventors -----------------
router.get("/inventors", async (req, res) => {
  try {
    const inventors = await User.find({ role: "inventor" });
    res.json(inventors);
  } catch (err) {
    console.error("Error fetching inventors:", err);
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Get Only Investors -----------------
router.get("/investors", async (req, res) => {
  try {
    const investors = await User.find({ role: "investor" });
    res.json(investors);
  } catch (err) {
    console.error("Error fetching investors:", err);
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Get All Users -----------------
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ FIX 3: Approval PATCH — also before generic /:id routes
// ----------------- Approve or Reject a User -----------------
router.patch("/:id/approval", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'." });
    }

    const update = {
      approvalStatus: status,
      isApproved: status === "approved",
      rejectionReason: reason || "",
    };

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${status} successfully`, user });
  } catch (err) {
    console.error("Error updating approval:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- DELETE User by ID -----------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(`Deleted user: ${user.name} (${user._id})`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- Update User by ID -----------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully!", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;