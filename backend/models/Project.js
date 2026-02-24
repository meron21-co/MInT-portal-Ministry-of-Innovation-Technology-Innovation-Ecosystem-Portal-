import mongoose from "mongoose";

// 🔹 Sub-schema for Answer
const AnswerSchema = new mongoose.Schema({
  text: { type: String },
  resolved: { type: Boolean, default: false },
  highlight: { type: Boolean, default: false },
}, { _id: false });

// 🔹 Sub-schema for Question
const QuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true }, // frontend uses Date.now() as id
  text: { type: String, required: true },
  answer: { type: AnswerSchema, default: null },
}, { timestamps: true });

// 🔹 Main Project Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  expectedProfit: { type: Number, default: 0 },
  problemStatement: { type: String },
  category: { type: String, default: "Other" },
  images: [{ type: String }],
  videos: [{ type: String }],

  // ✅ Status + rejection reason
  status: { type: String, default: "Pending" },
  rejectionReason: { type: String, default: null },

  // ✅ Inventor info
  inventorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  inventorEmail: { type: String, required: true },
  inventorName: { type: String, required: true },


investmentRequests: [
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      default: "Pending"
    }
  }
],

soldTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null
},

status: {
  type: String,
  enum: ["Pending", "Approved", "Rejected", "Sold"],
  default: "Pending"
},

  // ✅ Q&A
  questions: { type: [QuestionSchema], default: [] },

}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export default Project;
