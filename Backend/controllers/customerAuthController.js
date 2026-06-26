import Customer from "../models/Customer.js";
import TempCustomer from "../models/TempCustomer.js";
import Address from "../models/Address.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";

// ==============================
// ⭐ Helper: Generate 6-Digit OTP
// ==============================
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==============================
// ⭐ Generate JWT
// ==============================
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }  // Token expires in 24 hours
  );
};

// ==============================
// ⭐ REGISTER CUSTOMER (Saves to TempCustomer)
// ==============================
export const registerCustomer = async (req, res) => {
  try {
    console.log("=== Registration Attempt Started ===");
    const { name, email, phone, password, address, addressLine1, addressLine2, city, state, postalCode } = req.body;

    if (!name || !email || !phone || !password) {
      console.log("❌ Registration Failed: Missing fields", { name: !!name, email: !!email, phone: !!phone, password: !!password });
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Check if verified email exists in Customer
    const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      console.log("❌ Registration Failed: Email already exists", email);
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check if verified phone exists in Customer
    const phoneExists = await Customer.findOne({ phone });
    if (phoneExists) {
      console.log("❌ Registration Failed: Phone already exists", phone);
      return res.status(400).json({
        message: "Phone number already registered",
      });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Registration OTP
    const otp = generateOtpCode();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    console.log("Saving temp user details in DB...");
    const tempUser = await TempCustomer.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        name,
        phone,
        password: hashedPassword,
        address: address || "",
        addressLine1: addressLine1 || "",
        addressLine2: addressLine2 || "",
        city: city || "",
        state: state || "",
        postalCode: postalCode || "",
        otp,
        otpExpires,
      },
      { upsert: true, new: true }
    );

    console.log("✅ Temporary registration created successfully:", tempUser._id);

    // Fire-and-forget sending verification email
    sendVerificationEmail(email, name, otp).catch(err => {
      console.error("❌ Failed to send registration verification email:", err.message);
    });

    // Remove password and OTP before response
    const { password: _, otp: __, ...safeTempUser } = tempUser._doc;

    return res.status(201).json({
      message: "Registration successful. Please verify your email with the OTP sent to your inbox.",
      user: safeTempUser,
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      console.log("❌ Validation Error:", messages);
      return res.status(400).json({
        message: messages.join(", "),
      });
    }
    return res.status(500).json({
      message: "Customer registration failed",
    });
  }
};

// ==============================
// ⭐ VERIFY EMAIL OTP (Creates verified user in Customer)
// ==============================
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }

    const cleanedEmail = email.toLowerCase().trim();

    // Check if already verified in Customer
    const verifiedUser = await Customer.findOne({ email: cleanedEmail });
    if (verifiedUser) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Find in TempCustomer
    const tempUser = await TempCustomer.findOne({ email: cleanedEmail });
    if (!tempUser) {
      return res.status(404).json({ message: "Registration session not found. Please sign up again." });
    }

    // Validate OTP and expiration
    if (tempUser.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > tempUser.otpExpires) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    // OTP matches! Create verified customer record in main DB
    console.log("Creating verified Customer...");
    const user = await Customer.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
      address: tempUser.address,
      isVerified: true,
    });

    // Create default Address record if address details were provided during sign up
    if (tempUser.addressLine1 || tempUser.city || tempUser.state || tempUser.postalCode) {
      console.log("Creating default address document in DB...");
      await Address.create({
        customerId: user._id,
        fullname: tempUser.name,
        phone: tempUser.phone,
        pincode: tempUser.postalCode || "",
        state: tempUser.state || "",
        city: tempUser.city || "",
        addressLine: tempUser.addressLine1 || "",
        landmark: tempUser.addressLine2 || "",
        isDefault: true
      });
      console.log("✅ Address document created successfully");
    }

    // Delete temp customer record
    await TempCustomer.deleteOne({ email: cleanedEmail });
    console.log("✅ Temporary customer record deleted");

    const token = generateToken(user._id);
    const { password: _, resetPasswordOtp: __, ...safeUser } = user._doc;

    return res.json({
      message: "Email verified successfully. Welcome to Plenora!",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("❌ Email Verification Error:", err);
    return res.status(500).json({ message: "Email verification failed" });
  }
};

// ==============================
// ⭐ RESEND VERIFICATION OTP (From TempCustomer)
// ==============================
export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanedEmail = email.toLowerCase().trim();

    // Check if verified first
    const alreadyVerified = await Customer.findOne({ email: cleanedEmail });
    if (alreadyVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const tempUser = await TempCustomer.findOne({ email: cleanedEmail });

    if (!tempUser) {
      return res.status(404).json({ message: "Registration session not found. Please sign up again." });
    }

    const otp = generateOtpCode();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    tempUser.otp = otp;
    tempUser.otpExpires = otpExpires;
    await tempUser.save();

    sendVerificationEmail(tempUser.email, tempUser.name, otp).catch(err => {
      console.error("❌ Failed to send resent verification email:", err.message);
    });

    return res.json({ message: "Verification code resent successfully" });
  } catch (err) {
    console.error("❌ Resend OTP Error:", err);
    return res.status(500).json({ message: "Failed to resend verification code" });
  }
};

// ==============================
// ⭐ LOGIN CUSTOMER (Enforces Verification via TempCustomer Check)
// ==============================
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email/Phone and password are required",
      });
    }

    const cleanedInput = email.trim();
    const digitsOnly = cleanedInput.replace(/\D/g, '');
    const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '';

    const queryConditions = [
      { email: cleanedInput.toLowerCase() }
    ];

    if (last10Digits) {
      const regexStr = last10Digits.split('').join('\\D*');
      queryConditions.push({ phone: { $regex: new RegExp(regexStr + '$') } });
    } else {
      queryConditions.push({ phone: cleanedInput });
    }

    // 1. Check if unverified/temp registration exists
    const isTempUser = await TempCustomer.findOne({
      $or: queryConditions
    });

    if (isTempUser) {
      // Auto-trigger a new OTP to help them complete verification
      const otp = generateOtpCode();
      isTempUser.otp = otp;
      isTempUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await isTempUser.save();
      sendVerificationEmail(isTempUser.email, isTempUser.name, otp).catch(err => {});

      return res.status(403).json({
        message: "Your email address is not verified. A verification code has been sent to your inbox.",
        isVerified: false
      });
    }

    // 2. Load verified user
    const user = await Customer.findOne({
      $or: queryConditions
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);
    const { password: _, verificationOtp: __, resetPasswordOtp: ___, ...safeUser } = user._doc;

    return res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// ==============================
// ⭐ FORGOT PASSWORD (Sends Reset OTP)
// ==============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Customer.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Generic message to prevent user enumeration
      return res.json({ message: "If this email is registered, a password reset code has been sent." });
    }

    const otp = generateOtpCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = {
      code: otp,
      expiresAt: expires,
    };
    await user.save();

    sendPasswordResetEmail(user.email, user.name, otp).catch(err => {
      console.error("❌ Failed to send password reset email:", err.message);
    });

    return res.json({ message: "If this email is registered, a password reset code has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Failed to generate password reset request" });
  }
};

// ==============================
// ⭐ RESET PASSWORD (Uses OTP)
// ==============================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await Customer.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const resetOtp = user.resetPasswordOtp;
    if (!resetOtp || resetOtp.code !== otp.trim()) {
      return res.status(400).json({ message: "Invalid or missing password reset code" });
    }

    if (new Date() > resetOtp.expiresAt) {
      return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    
    // Automatically verify the email if they resets their password successfully
    user.isVerified = true; 
    
    await user.save();

    return res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

// ==============================
// ⭐ CHANGE PASSWORD (Authenticated)
// ==============================
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // From authenticate middleware

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Check if old and new passwords are the same
    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    // Find user with password field
    const user = await Customer.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({
      message: "Failed to change password",
    });
  }
};
