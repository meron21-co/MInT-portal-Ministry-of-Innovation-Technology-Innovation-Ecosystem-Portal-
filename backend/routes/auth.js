import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/authMiddleware.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY ✔ Email server is working");
  }
});
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
      nationalId,
      passportNumber,
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
    if (!nationalId && !passportNumber) {
  return res.status(400).json({
    success: false,
    message: "National ID or Passport number required"
  });
}

    const normalizedRole = role.toLowerCase();
    if (!["inventor", "investor",].includes(normalizedRole)) {
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
      nationalId: nationalId || "",      
      passportNumber: passportNumber || ""
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

          if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Invalid credentials" });
          }

          // ✅ Block if not approved (skip check for admin)
          if (user.role !== "admin" && user.approvalStatus !== "approved") {
            return res.status(403).json({
              message: user.approvalStatus === "rejected"
                ? `Your account was rejected. Reason: ${user.rejectionReason}`
                : "Your account is pending admin approval.",
              approvalStatus: user.approvalStatus
            });
          }

          const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
          res.json({ token, user });

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


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

 if (!user) {
  return res.json({ message: "If email exists, reset link sent" });
}

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpire = Date.now() + 1000 * 60 * 60;
  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  try {
 await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Password Reset",
  html: `
    <h3>Password Reset</h3>
    <p>Click below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
  `,
});

    res.json({ message: "Reset link sent to email" });

    
} catch (error) {
  console.error("🔥 EMAIL ERROR FULL:", error);
  console.error("🔥 EMAIL MESSAGE:", error.message);

  res.status(500).json({
    message: "Email not sent",
    error: error.message,
  });
}


});




router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
});

export default router;
