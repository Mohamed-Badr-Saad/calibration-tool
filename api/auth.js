import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User";
import bcrypt from "bcryptjs";

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function comparePassword(candidate, hash) {
  return bcrypt.compare(candidate, hash);
}

export default async function handler(req, res) {
  await dbConnect();

  // Login
  if (req.method === "POST" && req.query.action === "login") {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // Super admin login logic
    if (
      email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase() &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      let superAdmin = await User.findOne({ email: new RegExp(process.env.SUPER_ADMIN_EMAIL, "i") });
      if (!superAdmin) {
        superAdmin = new User({
          email: process.env.SUPER_ADMIN_EMAIL.toLowerCase(),
          name: process.env.SUPER_ADMIN_NAME || "Super Admin",
          password: process.env.SUPER_ADMIN_PASSWORD,
          role: "admin",
          jobTitle: "engineer",
          isActive: true,
        });
        await superAdmin.save();
      }
      superAdmin.lastLogin = new Date();
      await superAdmin.save();
      const token = generateToken(superAdmin.id);
      return res.json({
        message: "Super Admin login successful",
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          role: superAdmin.role,
          jobTitle: superAdmin.jobTitle,
          isActive: superAdmin.isActive,
        },
        token,
      });
    } else {
      // Normal user login
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
      if (!user.isActive)
        return res.status(401).json({ message: "Account is deactivated" });
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });
      user.lastLogin = new Date();
      await user.save();
      const token = generateToken(user.id);
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          jobTitle: user.jobTitle,
          isActive: user.isActive,
        },
        token,
      });
    }
    return;
  }

  // Signup
  if (req.method === "POST" && req.query.action === "signup") {
    const { email, name, password, jobTitle } = req.body;
    if (!email || !name || !password || !jobTitle)
      return res.status(400).json({ message: "Email, name, and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (
      email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase()
    )
      return res.status(400).json({ message: "This email is reserved. Please use a different email." });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "User already exists with this email" });

    const user = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      password,
      role: "user",
      jobTitle,
    });
    const savedUser = await user.save();
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        jobTitle: savedUser.jobTitle,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt,
      },
    });
    return;
  }

  // Get current user
  if (req.method === "GET" && req.query.action === "me") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "No token, authorization denied" });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user)
        return res.status(401).json({ message: "Token is not valid" });
      if (!user.isActive)
        return res.status(401).json({ message: "Account is deactivated" });
      res.json(user);
    } catch (error) {
      res.status(401).json({ message: "Token is not valid" });
    }
    return;
  }

  // Logout
  if (req.method === "POST" && req.query.action === "logout") {
    // Stateless JWT: nothing to do server-side
    res.json({ message: "Logout successful" });
    return;
  }

  res.setHeader("Allow", ["POST", "GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
