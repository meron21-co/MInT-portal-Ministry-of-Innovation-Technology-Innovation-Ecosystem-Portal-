const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  inventor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  rejectionReason: String, // optional
  // other fields...
});
