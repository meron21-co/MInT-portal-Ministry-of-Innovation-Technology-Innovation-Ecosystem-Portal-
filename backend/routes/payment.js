import express from "express";
import fetch from "node-fetch";
import Payment from "../models/Payment.js";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// -------------------- SINGLE PAYMENT --------------------
router.post("/:projectId/pay", authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { amount, name } = req.body;
  const email = req.user?.email || req.body.email;

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount < 5000) {
    return res.status(400).json({ message: "Minimum investment is 5000 ETB" });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tx_ref = `project_${projectId}_${Date.now()}`;

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: numericAmount,
        currency: "ETB",
        email,
        first_name: name || "Investor",
        tx_ref,
        return_url: `http://localhost:3000/payment-success?tx_ref=${tx_ref}`,
      }),
    });

    const data = await response.json();
    if (data.status !== "success") return res.status(400).json({ message: "Chapa Init Failed", data });

    await Payment.create({
      tx_ref,
      projects: [{
        projectId: project._id,
        projectName: project.title,
        amount: numericAmount,
      }],
      amount: numericAmount,
      email,
      status: "pending",
      receipt_url: data.data.checkout_url,
      method: "Chapa",
    });

    res.json({ payment_url: data.data.checkout_url });
  } catch (err) {
    console.error("Payment init error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- CART PAYMENT --------------------
router.post("/cart-pay", authMiddleware, async (req, res) => {
  const { projects, name } = req.body;
  const email = req.user?.email || req.body.email;

  if (!Array.isArray(projects) || projects.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  try {
    const validProjects = projects.map(p => ({
      projectId: p.projectId,
      projectName: p.projectName || "Project",
      amount: Number(p.amount || 0),
    }));

    const totalAmount = validProjects.reduce((sum, p) => sum + p.amount, 0);
    const tx_ref = `cart_${Date.now()}`;

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "ETB",
        email,
        first_name: name || "Investor",
        tx_ref,
        return_url: `http://localhost:3000/payment-success?tx_ref=${tx_ref}`,
      }),
    });

    const data = await response.json();
    if (data.status !== "success") return res.status(400).json({ message: "Cart payment failed", data });

    await Payment.create({
      tx_ref,
      projects: validProjects,
      amount: totalAmount,
      email,
      status: "pending",
      receipt_url: data.data.checkout_url,
      method: "Chapa",
    });

    res.json({ payment_url: data.data.checkout_url });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



// -------------------- VERIFY PAYMENT (THE FIX) --------------------
// -------------------- VERIFY PAYMENT (FINAL FIX) --------------------
router.get("/verify/:tx_ref", async (req, res) => {
  const { tx_ref } = req.params;
  console.log("--- Verifying:", tx_ref);

  try {
    const response = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();
    const paymentRecord = await Payment.findOne({ tx_ref: tx_ref.trim() });

    if (!paymentRecord) {
      return res
        .status(404)
        .json({ status: "failed", message: "Record not found" });
    }

    if (data.status === "success" && data.data.status === "success") {

      // update only once
      if (paymentRecord.status !== "success") {
        paymentRecord.status = "success";
        await paymentRecord.save();

        for (const item of paymentRecord.projects) {
          console.log(`Updating Project ${item.projectId} with +${item.amount}`);

          await Project.findByIdAndUpdate(
            item.projectId,
            { $inc: { raised: item.amount } },
            { new: true }
          );
        }
      }

      // 🔥 IMPORTANT: fetch updated projects from DB
      const updatedProjects = await Project.find({
        _id: { $in: paymentRecord.projects.map(p => p.projectId) }
      });

      return res.json({
        status: "success",
        tx_ref,
        amount: paymentRecord.amount,
        email: paymentRecord.email,
        projects: updatedProjects, // RETURN UPDATED
      });
    }

    return res.json({
      status: "failed",
      message: "Verification failed",
    });

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ status: "error" });
  }
});



export default router;