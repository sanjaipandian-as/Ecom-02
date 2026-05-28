import Customer from "../models/Customer.js";
import Address from "../models/Address.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
// ⭐ REGISTER CUSTOMER
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

    // Check email exists
    const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      console.log("❌ Registration Failed: Email already exists", email);
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check phone exists
    const phoneExists = await Customer.findOne({ phone });
    if (phoneExists) {
      console.log("❌ Registration Failed: Phone already exists", phone);
      return res.status(400).json({
        message: "Phone number already registered",
      });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating customer in DB...");
    const user = await Customer.create({
      name,
      email,
      phone,
      password: hashedPassword,
      address: address || "",
    });

    console.log("✅ Customer created successfully:", user._id);

    // Create the default Address record for the Address Settings page
    if (addressLine1 || city || state || postalCode) {
      console.log("Creating default address document in DB...");
      await Address.create({
        customerId: user._id,
        fullname: name,
        phone: phone,
        pincode: postalCode || "",
        state: state || "",
        city: city || "",
        addressLine: addressLine1 || "",
        landmark: addressLine2 || "",
        isDefault: true
      });
      console.log("✅ Address document created successfully");
    }

    const token = generateToken(user._id);

    // remove password before response
    const { password: _, ...safeUser } = user._doc;

    return res.status(201).json({
      message: "Customer registered successfully",
      token,
      user: safeUser,
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
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      console.log("❌ Duplicate Key Error:", field);
      return res.status(400).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }
    return res.status(500).json({
      message: "Customer registration failed",
    });
  }
};

// ==============================
// ⭐ LOGIN CUSTOMER
// ==============================
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email/Phone and password are required",
      });
    }

    // ⭐ IMPORTANT: explicitly fetch password by email or phone lookup (flexible phone format matching)
    const cleanedInput = email.trim();
    const digitsOnly = cleanedInput.replace(/\D/g, '');
    const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '';

    const queryConditions = [
      { email: cleanedInput.toLowerCase() }
    ];

    if (last10Digits) {
      // Construct regex to match the last 10 digits ignoring non-digit characters in between (e.g. spaces, dashes)
      const regexStr = last10Digits.split('').join('\\D*');
      queryConditions.push({ phone: { $regex: new RegExp(regexStr + '$') } });
    } else {
      queryConditions.push({ phone: cleanedInput });
    }

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

    const { password: _, ...safeUser } = user._doc;

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
// ⭐ CHANGE PASSWORD
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
