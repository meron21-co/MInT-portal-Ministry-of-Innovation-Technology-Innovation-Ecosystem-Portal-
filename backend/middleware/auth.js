import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Token is not valid" });
    }

    // 3️⃣ Fetch user from DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4️⃣ Attach user info to request
    req.user = user;          // full user object
    req.userId = user._id;    // easy reference
    req.userRole = user.role; // optional for role-based access

    next(); // proceed to next middleware or route
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export default authMiddleware;
