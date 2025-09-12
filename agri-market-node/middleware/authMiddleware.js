// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Protect routes (check if user is logged in)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

// Middleware to allow only clients
export const clientOnly = (req, res, next) => {
  if (req.user && req.user.role === "client") {
    next();
  } else {
    res.status(403).json({ message: "Access restricted to clients only" });
  }
};

// Middleware to allow only farmers
export const farmerOnly = (req, res, next) => {
  if (req.user && req.user.role === "farmer") {
    next();
  } else {
    res.status(403).json({ message: "Access restricted to farmers only" });
  }
};
