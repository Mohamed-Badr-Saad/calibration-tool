import mongoose from "mongoose";
const Technician = require("../models/Technician");

// Utility for MongoDB connection (place elsewhere if re-used)
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

// Handler for all Technician API requests
export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const technicians = await Technician.find();
      res.status(200).json(technicians);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const technician = new Technician(req.body);
      const savedTech = await technician.save();
      res.status(201).json(savedTech);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    try {
      const updatedTech = await Technician.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedTech) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.json(updatedTech);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const deletedTech = await Technician.findByIdAndDelete(id);
      if (!deletedTech) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.json({ message: "Technician deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  // Method not allowed
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
