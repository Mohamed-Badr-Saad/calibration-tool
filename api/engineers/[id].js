const engineerSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Engineer = mongoose.model("Engineer", engineerSchema);

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  await dbConnect();

  if (method === "PUT") {
    try {
      const updated = await Engineer.findByIdAndUpdate(id, req.body, {
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
