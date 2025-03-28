import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // TODO: Save donation in database (e.g., Supabase, Firebase, etc.)
    return res.status(200).json({ message: "Donation recorded" });
  }
  res.status(405).json({ error: "Method Not Allowed" });
}
