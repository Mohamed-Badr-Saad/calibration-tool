import jwt from "jsonwebtoken";
import User from "/models/User";
import mongoose from "mongoose";

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  await dbConnect();
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user)
      return res.status(401).json({ message: "Token not valid" });
    if (!user.isActive)
      return res.status(401).json({ message: "Account is deactivated" });

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Token not valid" });
  }
}
