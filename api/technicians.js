import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const Technician = mongoose.models.Technician || mongoose.model("Technician", technicianSchema);

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

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

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
