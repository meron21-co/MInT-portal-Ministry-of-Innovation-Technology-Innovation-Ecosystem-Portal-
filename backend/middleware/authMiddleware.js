import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    const token = authHeader.split(" ")[1];

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
    req.user = {
      id: user._id.toString(),  // always use string for consistency
      role: user.role,
      name: user.name,
      email: user.email,
       profile: user.profile,
    };

    next(); // proceed to next middleware or route
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export default authMiddleware;
