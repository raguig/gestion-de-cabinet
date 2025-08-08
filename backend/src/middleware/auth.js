import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the doctor by the decoded ID and attach it to the request
      req.user = await Doctor.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First run the protect middleware
    await protect(req, res, async () => {
      // Then check if user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ 
          message: "Access denied. Admin privileges required." 
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};