import dbConnect from "../../path/to/dbConnect"; // Adjust path
import Technician from "../../path/to/models/Technician"; // Adjust path

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  await dbConnect();

  if (method === "PUT") {
    try {
      const updated = await Technician.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
