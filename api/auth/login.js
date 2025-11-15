import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../server/models/User";
import bcrypt from "bcryptjs";

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await dbConnect();

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Super admin check
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
    }

    // Normal user login
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isActive) return res.status(401).json({ message: "Account is deactivated" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
