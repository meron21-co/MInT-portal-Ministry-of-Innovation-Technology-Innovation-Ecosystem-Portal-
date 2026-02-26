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
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });



// ----------------- Upload Profile Image -----------------
router.put(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // delete old image
      if (user.profile) {
        const oldPath = path.join(
          profileDir,
          path.basename(user.profile)
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // save new image
      user.profile = `/uploads/profiles/${req.file.filename}`;
      await user.save();

     res.json({
  message: "Profile updated successfully",
    profile: user.profile,
  user,
});

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


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


// ----------------- DELETE User by ID -----------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Deleted user: ${user.name} (${user._id})`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,   // return updated document
      runValidators: true, // apply schema validations
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully!", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
