import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";

const attachAuthenticatedUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user =
    (await Customer.findById(decoded.id)) ||
    (await Admin.findById(decoded.id));

  if (!user) {
    throw new Error("User not found for token");
  }

  req.user = user;
  req.role = user instanceof Admin ? "admin" : "customer";
  return true;
};

export const authenticate = async (req, res, next) => {
  try {
    const hasUser = await attachAuthenticatedUser(req);
    if (!hasUser) {
      return res.status(401).json({ message: "Authorization token missing" });
    }
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    await attachAuthenticatedUser(req);
  } catch (error) {
    req.user = null;
    req.role = null;
  }
  next();
};
