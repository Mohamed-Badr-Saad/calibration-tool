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
  console.log("Request URL:", req.url);
  console.log("Request query:", req.query);

  await dbConnect();

  const { method, query } = req;
  const { id } = query;

  if (method === "PUT") {
    console.log("Handling PUT for id:", id);
    try {
      const updated = await Technician.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) {
        console.log("Technician not found");
        return res.status(404).json({ message: "Technician not found" });
      }
      console.log("Technician updated:", updated);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("PUT error:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  // Add GET, DELETE as needed or keep as previously shown.

  console.log(`Method ${method} not allowed`);
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
