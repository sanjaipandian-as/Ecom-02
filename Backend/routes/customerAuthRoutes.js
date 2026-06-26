import express from "express";
import {
  registerCustomer,
  loginCustomer,
  changePassword,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/customerAuthController.js";
import { authenticate } from "../middleware/auth.js";
import { passwordChangeLimiter, emailOtpLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.put("/change-password", authenticate, passwordChangeLimiter, changePassword);

// ⭐ Verification & Reset Routes
router.post("/verify-email", passwordChangeLimiter, verifyEmail);
router.post("/resend-verification", emailOtpLimiter, resendVerificationOtp);
router.post("/forgot-password", emailOtpLimiter, forgotPassword);
router.post("/reset-password", passwordChangeLimiter, resetPassword);

export default router;
