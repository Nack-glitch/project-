// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Protect routes: Check if user is logged in
export const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object to request without password
      const foundUser = await User.findById(decoded.id).select("-password");
      if (!foundUser) {
        console.warn("Warning: User not found for token", decoded.id);
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = foundUser;
      return next();
    }

    // No token
    return res.status(401).json({ message: "No token, authorization denied" });
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Middleware to allow only clients
export const clientOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Access restricted to clients only" });
  }

  next();
};

// Middleware to allow only farmers
export const farmerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "farmer") {
    return res.status(403).json({ message: "Access restricted to farmers only" });
  }

  next();
};
