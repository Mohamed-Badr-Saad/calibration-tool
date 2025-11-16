import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const Technician = mongoose.models?.Technician || mongoose.model("Technician", technicianSchema);

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  console.log("Request method:", req.method);
  console.log("Query ID:", req.query.id);

  await dbConnect();

  const { method, query } = req;
  const { id } = query;

  if (method === "GET") {
    console.log("Handling GET");
    try {
      const tech = await Technician.findById(id);
      if (!tech) {
        console.log("Technician not found");
        return res.status(404).json({ message: "Technician not found" });
      }
      return res.status(200).json(tech);
    } catch (error) {
      console.error("GET error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  if (method === "PUT") {
    console.log("Handling PUT");
    try {
      const updated = await Technician.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) {
        console.log("Technician not found for update");
        return res.status(404).json({ message: "Technician not found" });
      }
      console.log("Update successful", updated);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("PUT error:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  if (method === "DELETE") {
    console.log("Handling DELETE");
    try {
      const deleted = await Technician.findByIdAndDelete(id);
      if (!deleted) {
        console.log("Technician not found for delete");
        return res.status(404).json({ message: "Technician not found" });
      }
      console.log("Delete successful");
      return res.status(200).json({ message: "Technician deleted" });
    } catch (error) {
      console.error("DELETE error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  console.log(`Method ${method} not allowed`);
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
