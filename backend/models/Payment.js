import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  price: Number,
  tx_ref: { type: String, required: true, unique: true },
  email: { type: String, required: true }, 
  amount: { type: Number, required: true }, // Total paid
 
  // Array to handle both single and cart payments
  projects: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
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
  },

  raised: {
  type: Number,
  default: 0
},

}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);