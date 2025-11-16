import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Technician =
  mongoose.models.Technician || mongoose.model("Technician", technicianSchema);

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const { id } = req.query;

  if (method === "GET") {
    try {
      const technician = await Technician.findById(id);
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.status(200).json(technician);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  if (method === "PUT") {
    try {
      const updatedTech = await Technician.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedTech) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.status(200).json(updatedTech);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (method === "DELETE") {
    try {
      const deletedTech = await Technician.findByIdAndDelete(id);
      if (!deletedTech) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.status(200).json({ message: "Technician deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
