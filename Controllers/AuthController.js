const bcrypt = require("bcrypt");
const UserModel = require("../Models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const crypto = require("crypto");

// ----------------- FORGOT PASSWORD -----------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exist" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;   // <-- use FRONTEND_URL


    // TODO: integrate nodemailer here
     const transporter = nodemailer.createTransport({
      service: "gmail", // or "hotmail", "yahoo" etc.
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS  // app password (not your real password)
      }
    });

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request - FaceFinder",
      html: `
        <h3>Password Reset Request</h3>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>⚠️ This link will expire in 1 hour.</p>
      `,
    });
    console.log("Reset link:", resetLink);

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------- RESET PASSWORD -----------------
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ----------------- SIGNUP -----------------
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // generate JWT
    const jwtToken = jwt.sign(
      { email: newUser.email, _id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // send response
    res.status(201).json({
      message: "Signup successful",
      success: true,
      jwtToken,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// ----------------- LOGIN -----------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid Credentials", success: false });
    }

    // check password
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res
        .status(403)
        .json({ message: "Invalid Credentials", success: false });
    }

    // generate JWT
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // send response
    res.status(200).json({
      message: "Login Successful",
      success: true,
      jwtToken,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };

