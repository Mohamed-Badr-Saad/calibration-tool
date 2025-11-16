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
  console.log("Request method:", req.method);
  console.log("Request query id:", req.query.id);

  await dbConnect();

  const { method } = req;
  const { id } = req.query;

  if (method === "GET") {
    console.log("Handling GET for technician:", id);
    try {
      const technician = await Technician.findById(id);
      if (!technician) {
        console.log("Technician not found");
        return res.status(404).json({ message: "Technician not found" });
      }
      return res.status(200).json(technician);
    } catch (error) {
      console.error("GET error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  if (method === "PUT") {
    console.log("Handling PUT for technician:", id);
    try {
      const updated = await Technician.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) {
        console.log("Technician to update not found");
        return res.status(404).json({ message: "Technician not found" });
      }
      console.log("Successfully updated technician:", updated);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("PUT error:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  if (method === "DELETE") {
    console.log("Handling DELETE for technician:", id);
    try {
      const deleted = await Technician.findByIdAndDelete(id);
      if (!deleted) {
        console.log("Technician to delete not found");
        return res.status(404).json({ message: "Technician not found" });
      }
      console.log("Successfully deleted technician:", deleted);
      return res.status(200).json({ message: "Technician deleted successfully" });
    } catch (error) {
      console.error("DELETE error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  console.log(`Method ${method} Not Allowed`);
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
