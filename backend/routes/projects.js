import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, "..", "uploads");
const imagesDir = path.join(uploadsDir, "images");
const videosDir = path.join(uploadsDir, "videos");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, imagesDir);
    else if (file.mimetype.startsWith("video/")) cb(null, videosDir);
    else cb(new Error("Unsupported file type"), null);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ------------------ ROUTES ------------------

// Create project
router.post("/", upload.fields([{ name: "images" }, { name: "videos" }]), async (req, res) => {
  try {
    const { title, description, price, problemStatement, expectedProfit, category } = req.body;

    const inventor = req.user;
    if (!inventor) return res.status(401).json({ message: "Unauthorized" });

    const project = new Project({
      title,
      description,
      price,
      problemStatement,
      expectedProfit,
      category,
      inventorId: req.user.id, 
      inventorEmail: inventor.email,
      inventorName: inventor.name,
      images: req.files?.images?.map(f => `/uploads/images/${f.filename}`) || [],
      videos: req.files?.videos?.map(f => `/uploads/videos/${f.filename}`) || [],
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
// Investor requests investment
router.post("/:id/request", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (req.user.role !== "investor") {
      return res.status(403).json({ message: "Only investors can request" });
    }

    // prevent duplicate request
    const alreadyRequested = project.investmentRequests.find(
      r => r.investor.toString() === req.user.id
    );

    if (alreadyRequested) {
      return res.status(400).json({ message: "Already requested" });
    }

    // ✅ Add request
    project.investmentRequests.push({
      investor: req.user.id,
      status: "Pending",
    });

    // ⭐ VERY IMPORTANT
    // change project status automatically
    project.status = "Pending";

    await project.save();

    res.json({
      message: "Investment request sent!",
      project,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});



// Update project
router.put("/:id", upload.fields([{ name: "images" }, { name: "videos" }]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user;
    if (user.role !== "admin" && project.inventorEmail !== user.email) {
      return res.status(403).json({ message: "Forbidden: Not your project" });
    }

    const { title, description, price, problemStatement, expectedProfit, category, removeImages, removeVideos } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (price) project.price = price;
    if (problemStatement) project.problemStatement = problemStatement;
    if (expectedProfit) project.expectedProfit = expectedProfit;
    if (category) project.category = category;

    // Remove old images
    if (removeImages) {
      const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      project.images = project.images.filter(img => {
        const filename = path.basename(img);
        if (imagesToRemove.includes(filename)) {
          const filePath = path.join(imagesDir, filename);
          try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
          return false;
        }
        return true;
      });
    }



    // Remove old videos
    if (removeVideos) {
      const videosToRemove = Array.isArray(removeVideos) ? removeVideos : [removeVideos];
      project.videos = project.videos.filter(vid => {
        const filename = path.basename(vid);
        if (videosToRemove.includes(filename)) {
          const filePath = path.join(videosDir, filename);
          try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
          return false;
        }
        return true;
      });
    }

    // Add new uploaded files
    if (req.files?.images) project.images.push(...req.files.images.map(f => `/uploads/images/${f.filename}`));
    if (req.files?.videos) project.videos.push(...req.files.videos.map(f => `/uploads/videos/${f.filename}`));

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    const user = req.user;
    let projects;

    if (user.role === "admin") {
      // ✅ ADMIN sees everything + investor info
      projects = await Project.find({})
        .populate("investmentRequests.investor", "name email")
        .populate("soldTo", "name email");

    } else if (user.role === "inventor") {
      // ✅ Inventor sees own projects
      projects = await Project.find({
        inventorEmail: user.email,
      });

    } else {
      // ✅ Investor sees approved + sold projects
      projects = await Project.find({
        status: { $in: ["Approved", "Sold"] },
      })
        .populate("investmentRequests.investor", "name email")
        .populate("soldTo", "name email");
    }

    res.json(projects);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


// Get single project
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user;
    if (user.role !== "admin" && project.inventorEmail !== user.email) {
      return res.status(403).json({ message: "Forbidden: Not your project" });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete image
router.delete("/:id/images/:filename", async (req, res) => {
  try {
    const { id, filename } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user;
    if (user.role !== "admin" && project.inventorEmail !== user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    project.images = project.images.filter(img => !img.includes(filename));
    const filePath = path.join(imagesDir, filename);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}

    await project.save();
    res.json({ message: "Image deleted successfully", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete video
router.delete("/:id/videos/:filename", async (req, res) => {
  try {
    const { id, filename } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = req.user;
    if (user.role !== "admin" && project.inventorEmail !== user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    project.videos = project.videos.filter(v => !v.includes(filename));
    const filePath = path.join(videosDir, filename);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}

    await project.save();
    res.json({ message: "Video deleted successfully", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
// // Update project status (Approve / Reject) with reason
// router.patch("/:id/status", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, reason } = req.body;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ message: "Invalid project ID" });
//     }

//     if (!["Approved", "Rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status value" });
//     }

//     const user = req.user;
//     if (user.role !== "admin") {
//       return res.status(403).json({ message: "Forbidden: Only admin can change status" });
//     }

//     const project = await Project.findById(id);
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     // ✅ Update status and rejection reason
//     project.status = status;
//     project.rejectionReason = status === "Rejected" ? (reason || "No reason provided") : null;

//     await project.save();
//     res.json({ message: `Project ${status}`, project });

//   } catch (err) {
//     console.error("Error updating project status:", err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });


// Update project status (Approve / Reject) with reason
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can change status" });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // ✅ Update status & reason
    project.status = status;
    project.rejectionReason = status === "Rejected" ? (reason || "No reason provided") : null;

    await project.save();
    res.json({ message: `Project ${status}`, project });

  } catch (err) {
    console.error("Error updating project status:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Admin approves investment request
router.put("/:projectId/approve-request/:investorId", async (req, res) => {
  try {
    const { projectId, investorId } = req.params;

    const project = await Project.findById(projectId);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin allowed" });

    if (project.status === "Sold")
      return res.status(400).json({ message: "Already sold" });

    // ✅ approve selected investor
    project.investmentRequests.forEach(r => {
      if (r.investor.toString() === investorId)
        r.status = "Approved";
      else
        r.status = "Rejected";
    });

    project.status = "Sold";
    project.soldTo = investorId;

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("investmentRequests.investor", "name email")
      .populate("soldTo", "name email");

    res.json({
      message: "Project Sold Successfully",
      project: updatedProject
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


export default router;
