import mongoose from "mongoose";
import Engineer from "../server/models/Engineer";

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const engineers = await Engineer.find();
      res.status(200).json(engineers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const engineer = new Engineer(req.body);
      const savedEng = await engineer.save();
      res.status(201).json(savedEng);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    try {
      const updatedEng = await Engineer.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      if (!updatedEng) {
        return res.status(404).json({ message: "Engineer not found" });
      }
      res.json(updatedEng);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const deletedEng = await Engineer.findByIdAndDelete(id);
      if (!deletedEng) {
        return res.status(404).json({ message: "Engineer not found" });
      }
      res.json({ message: "Engineer deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
