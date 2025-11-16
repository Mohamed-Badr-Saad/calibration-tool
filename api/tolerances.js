import mongoose from "mongoose";
import Tolerance from "./models/Tolerance";

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      let tolerance = await Tolerance.findOne();
      // Create default tolerances if none exist
      if (!tolerance) {
        tolerance = new Tolerance({
          transmitterTolerance: 0.5,
          gaugeTolerance: 1,
          controlValveTolerance: 1,
          onOffValveTimeTolerance: 10,
          onOffValveFeedbackTolerance: 3,
          switchTolerance: 5,
          unit: "",
        });
        await tolerance.save();
      }
      res.status(200).json(tolerance);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    return;
  }

  if (req.method === "PUT") {
    try {
      const {
        transmitterTolerance,
        gaugeTolerance,
        controlValveTolerance,
        onOffValveTimeTolerance,
        onOffValveFeedbackTolerance,
        switchTolerance,
        unit,
      } = req.body;

      let tolerance = await Tolerance.findOne();

      if (tolerance) {
        // Update existing
        tolerance.transmitterTolerance =
          transmitterTolerance ?? tolerance.transmitterTolerance;
        tolerance.gaugeTolerance = gaugeTolerance ?? tolerance.gaugeTolerance;
        tolerance.controlValveTolerance =
          controlValveTolerance ?? tolerance.controlValveTolerance;
        tolerance.onOffValveTimeTolerance =
          onOffValveTimeTolerance ?? tolerance.onOffValveTimeTolerance;
        tolerance.onOffValveFeedbackTolerance =
          onOffValveFeedbackTolerance ?? tolerance.onOffValveFeedbackTolerance;
        tolerance.switchTolerance =
          switchTolerance ?? tolerance.switchTolerance;
        tolerance.unit = unit ?? tolerance.unit;
      } else {
        // Create new
        tolerance = new Tolerance({
          transmitterTolerance: transmitterTolerance ?? 0.5,
          gaugeTolerance: gaugeTolerance ?? 1,
          controlValveTolerance: controlValveTolerance ?? 1,
          onOffValveTimeTolerance: onOffValveTimeTolerance ?? 10,
          onOffValveFeedbackTolerance: onOffValveFeedbackTolerance ?? 3,
          switchTolerance: switchTolerance ?? 5,
          unit: unit ?? "",
        });
      }

      await tolerance.save();
      res.status(200).json(tolerance);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
