import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  tx_ref: { type: String, required: true, unique: true },

  user: {   // ✅ ADD THIS
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  email: { type: String, required: true },
  amount: { type: Number, required: true },

  projects: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
      projectName: String,
      amount: Number,
    }
  ],

  method: { type: String, default: "Chapa" },
  receipt_url: String,

  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  }

}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);