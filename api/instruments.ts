import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "database.json");

// Helper to load JSON
function loadDB() {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
}

// Helper to save JSON
function saveDB(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const db = loadDB();

  if (req.method === "GET") {
    return res.status(200).json(db.instruments ?? []);
  }

  if (req.method === "POST") {
    const newInstrument = req.body;
    db.instruments.push(newInstrument);
    saveDB(db);
    return res.status(201).json({ message: "Instrument added", newInstrument });
  }

  if (req.method === "PUT") {
    const { id, ...update } = req.body;
    const index = db.instruments.findIndex((i: any) => i.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });

    db.instruments[index] = { ...db.instruments[index], ...update };
    saveDB(db);
    return res.status(200).json({ message: "Instrument updated" });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    db.instruments = db.instruments.filter((i: any) => i.id !== id);
    saveDB(db);
    return res.status(200).json({ message: "Instrument deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
