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
      user: req.user._id,
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
   // ✅ Keep as ObjectId
    const validProjects = projects.map(p => ({
      projectId: p.projectId?._id || p.projectId,  // no .toString()
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
      user: req.user._id,
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

   const isPaid =
  data.status === "success" &&
  (data.data.status === "success" ||
   data.data.status === "completed" ||
   data.data.status === "paid");

if (isPaid) {

      // update only once
      if (paymentRecord.status !== "success") {
        paymentRecord.status = "success";
        await paymentRecord.save();

        for (const item of paymentRecord.projects) {
          console.log(`Updating Project ${item.projectId} with +${item.amount}`);

          const projectId =
        typeof item.projectId === "object"
        ? item.projectId._id.toString()
        : item.projectId.toString();

      await Project.findByIdAndUpdate(
        projectId,
        { $inc: { raised: item.amount } },
        { new: true }
      );
              }
      }

      // 🔥 IMPORTANT: fetch updated projects from DB
    const projectIds = paymentRecord.projects.map(p =>
  typeof p.projectId === "object"
    ? p.projectId._id
    : p.projectId
);

const updatedProjects = await Project.find({
  _id: { $in: projectIds }
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

// Backend
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find().populate("projects.projectId");
    res.json(payments);  // must use res.json, NOT res.send(html)
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/my-investments", authMiddleware, async (req, res) => {
  try {
    // ✅ Query by email instead of user ID (works for old AND new payments)
    const payments = await Payment.find({
      email: req.user.email,
      status: "success",
    }).populate("projects.projectId", "title expectedProfit price");

    let totalPaid = 0;
    const grouped = {};

    payments.forEach((payment) => {
      if (!Array.isArray(payment.projects)) return;

      payment.projects.forEach((p) => {
        if (!p) return;

        const id =
          p.projectId?._id?.toString() ||
          p.projectId?.toString() ||
          p.projectName;

        const projectName =
          p.projectId?.title ||
          p.projectName ||
          "Unknown Project";

        const amount = Number(p.amount || 0);
        totalPaid += amount;

        if (!grouped[id]) {
          grouped[id] = {
             projectId: id,
            projectName: p.projectId?.title || p.projectName || "Unknown Project",
            expectedProfit: p.projectId?.expectedProfit || 0, 
            price: p.projectId?.price || 0,                   
            total: 0,
          };
        }

        grouped[id].total += amount;
      });
    });

    res.json({
      totalPaid,
      projects: Object.values(grouped),
    });

  } catch (err) {
    console.error("My Investments Error:", err);
    res.status(500).json({
      message: "Server error while fetching investments",
    });
  }
});


export default router;