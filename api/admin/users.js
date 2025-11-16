import mongoose from "mongoose";
import User from "/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// DB connect util
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

// Auth helpers
async function getAuthUser(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return null;
    if (!user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

function isAdmin(user) {
  return user?.role === "admin";
}
function isSuperAdmin(user) {
  return user?.email && user.email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
}

// Permission
function canModifyUser(currentUser, targetUser) {
  if (isSuperAdmin(currentUser)) return { allowed: true };
  if (currentUser.role !== "admin") return { allowed: false, message: "Admin access required." };
  if (isSuperAdmin(targetUser)) return { allowed: false, message: "Only super admin can modify super admin account." };
  if (targetUser.role === "admin") return { allowed: false, message: "Only super admin can manage other admin accounts." };
  return { allowed: true };
}

export default async function handler(req, res) {
  await dbConnect();
  const authUser = await getAuthUser(req);
  if (!authUser || !isAdmin(authUser)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  // GET all users (filter super admin for non-super)
  if (req.method === "GET" && req.query.action === "users") {
    let query = {};
    if (!isSuperAdmin(authUser)) {
      query.email = { $ne: process.env.SUPER_ADMIN_EMAIL };
    }
    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    return res.json(users);
  }

  // CREATE new user
  if (req.method === "POST" && req.query.action === "users") {
    const { email, name, password, role, jobTitle } = req.body;
    if (!email || !name || !password || !role || !jobTitle) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["admin", "user"].includes(role))
      return res.status(400).json({ message: "Invalid role" });
    if (!["engineer", "technician"].includes(jobTitle))
      return res.status(400).json({ message: "Invalid job title" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    if (role === "admin" && !isSuperAdmin(authUser)) {
      return res.status(403).json({ message: "Only super admin can create admin accounts" });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "User already exists with this email" });

    const user = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      password,
      role,
      jobTitle,
      createdBy: authUser.id,
      isActive: true
    });
    await user.save();
    const returnUser = await User.findById(user.id).select("-password").populate("createdBy", "name email");
    return res.status(201).json({ message: "User created successfully", user: returnUser });
  }

  // UPDATE user by ID
  if (req.method === "PUT" && req.query.action === "users") {
    const { id } = req.query;
    const { email, name, password, role, jobTitle } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const permission = canModifyUser(authUser, user);
    if (!permission.allowed) return res.status(403).json({ message: permission.message });

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser.id.toString() !== id)
        return res.status(400).json({ message: "Email already in use" });
      user.email = email.toLowerCase();
    }
    if (name) user.name = name.trim();
    if (role && ["admin", "user"].includes(role)) {
      if (role === "admin" && !isSuperAdmin(authUser)) {
        return res.status(403).json({ message: "Only super admin can assign admin role" });
      }
      user.role = role;
    }
    if (password) {
      if (password.length < 6)
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      user.password = password;
    }
    if (jobTitle && ["engineer", "technician"].includes(jobTitle)) user.jobTitle = jobTitle;
    await user.save();
    const updatedUser = await User.findById(id).select("-password").populate("createdBy", "name email");
    return res.json({ message: "User updated successfully", user: updatedUser });
  }

  // PATCH user status (activate/deactivate)
  if (req.method === "PATCH" && req.query.action === "userStatus") {
    const { id } = req.query;
    const { isActive } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const permission = canModifyUser(authUser, user);
    if (!permission.allowed) return res.status(403).json({ message: permission.message });
    user.isActive = !!isActive;
    await user.save();
    return res.json({ message: `User ${isActive ? "activated" : "deactivated"} successfully`, user });
  }

  // DELETE user
  if (req.method === "DELETE" && req.query.action === "users") {
    const { id } = req.query;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const permission = canModifyUser(authUser, user);
    if (!permission.allowed) return res.status(403).json({ message: permission.message });
    await User.findByIdAndDelete(id);
    return res.json({ message: "User deleted successfully" });
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
