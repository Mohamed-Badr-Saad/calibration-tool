import mongoose from "mongoose";
import Instrument from "../models/Instrument";

// Utility to connect to DB, since serverless functions require special handling
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const instruments = await Instrument.find();
      res.status(200).json(instruments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const instrument = new Instrument(req.body);
      const savedInstrument = await instrument.save();
      res.status(201).json(savedInstrument);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    try {
      const updatedInstrument = await Instrument.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      if (!updatedInstrument) {
        return res.status(404).json({ message: "Instrument not found" });
      }
      res.json(updatedInstrument);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const deletedInstrument = await Instrument.findByIdAndDelete(id);
      if (!deletedInstrument) {
        return res.status(404).json({ message: "Instrument not found" });
      }
      res.json({ message: "Instrument deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  // If method is not supported
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
