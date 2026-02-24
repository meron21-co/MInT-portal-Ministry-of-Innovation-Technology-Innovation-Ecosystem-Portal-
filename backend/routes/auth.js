import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ----------------- Get user's projects -----------------
router.get("/projects/mine", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ inventorId: req.user.id });
    res.status(200).json({ success: true, projects });
  } catch (err) {
    console.error("Error fetching user projects:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------- Register -----------------
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      // Inventor fields
      project,
      skills,
      experience,
      portfolio,
      patentStatus,
      teamSize,
      // Investor fields
      company,
      budget,
      industryFocus,
      investmentType,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    const normalizedRole = role.toLowerCase();
    if (!["inventor", "investor", "admin"].includes(normalizedRole)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Build user object based on role
    const userData = {
      name,
      email,
      password, // ❌ Do not hash here, schema hook will hash it
      role: normalizedRole,
    };

    if (normalizedRole === "inventor") {
      userData.project = project || "";
      userData.skills = skills || "";
      userData.experience = experience || "beginner";
      userData.portfolio = portfolio || "";
      userData.patentStatus = patentStatus || "not-applied";
      userData.teamSize = teamSize ? Number(teamSize) : 0;
    } else if (normalizedRole === "investor") {
      userData.company = company || "";
      userData.budget = budget ? Number(budget) : 0;
      userData.industryFocus = industryFocus || "";
      userData.investmentType = investmentType || "equity";
    }

    const newUser = new User(userData);
    await newUser.save();

    // JWT
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env!");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      user: newUser, // thanks to toJSON, password is excluded
      token,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});


// ----------------- Login -----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env!");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Safe user object
    const userSafe = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
       profile: user.profile, 
    };

    res.status(200).json({ success: true, user: userSafe, token, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ----------------- Fetch all users -----------------
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------- Fetch inventors -----------------
router.get("/inventors", async (req, res) => {
  try {
    const inventors = await User.find({ role: "inventor" }).select("-password");
    res.status(200).json({ success: true, inventors });
  } catch (err) {
    console.error("Error fetching inventors:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------- Fetch investors -----------------
router.get("/investors", async (req, res) => {
  try {
    const investors = await User.find({ role: "investor" }).select("-password");
    res.status(200).json({ success: true, investors });
  } catch (err) {
    console.error("Error fetching investors:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
