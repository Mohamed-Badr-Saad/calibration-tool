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
  console.log("Incoming request method:", req.method);
  console.log("Query parameters:", req.query);

  await dbConnect();

  const { method, query } = req;
  const { id } = query;

  if (method === "PUT") {
    console.log(`Handling PUT for Technician ID: ${id}`);
    try {
      const updatedTech = await Technician.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedTech) {
        console.log("Technician not found for update");
        return res.status(404).json({ message: "Technician not found" });
      }
      console.log("Technician updated successfully:", updatedTech);
      return res.status(200).json(updatedTech);
    } catch (error) {
      console.error("PUT error:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  if (method === "GET") {
    console.log(`Handling GET for Technician ID: ${id}`);
    try {
      const tech = await Technician.findById(id);
      if (!tech) {
        console.log("Technician not found");
        return res.status(404).json({ message: "Technician not found" });
      }
      return res.status(200).json(tech);
    } catch (err) {
      console.error("GET error:", err);
      return res.status(500).json({ message: err.message });
    }
  }

  if (method === "DELETE") {
    console.log(`Handling DELETE for Technician ID: ${id}`);
    try {
      const deletedTech = await Technician.findByIdAndDelete(id);
      if (!deletedTech) {
        console.log("Technician not found for delete");
        return res.status(404).json({ message: "Technician not found" });
      }
      console.log("Technician deleted successfully");
      return res.status(200).json({ message: "Technician deleted successfully" });
    } catch (err) {
      console.error("DELETE error:", err);
      return res.status(500).json({ message: err.message });
    }
  }

  console.log(`Method ${method} not allowed`);
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
