import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["inventor", "investor", "admin"],
      required: true,
    },

    // Inventor fields
    project: { type: String, default: "" },
    skills: { type: String, default: "" },
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      default: "beginner",
    },
    portfolio: { type: String, default: "" },
    patentStatus: {
      type: String,
      enum: ["not-applied", "pending", "approved"],
      default: "not-applied",
    },
    teamSize: { type: Number, default: 0 },

    // Investor fields
    company: { type: String, default: "" },
    budget: { type: Number, default: 0 },
    industryFocus: { type: String, default: "" },
    investmentType: {
      type: String,
      enum: ["equity", "loan", "grant"],
      default: "equity",
    },

    profile: { type: String, default: "" },

    // ✅ FIXED FIELDS
    nationalId: { type: String, default: "" },
    passportNumber: { type: String, default: "" },

    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },

    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

// hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// hide password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);