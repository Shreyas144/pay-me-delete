import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null); // Prevents crash if request body is invalid
    if (!body || typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Save donation in Supabase
    const { error } = await supabase.from("donations").insert([{ amount: body.amount }]);

    if (error) {
      console.error("Supabase Error:", error); // Log error for debugging
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Donation recorded successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Server Error:", error); // Log error
    return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
  }
}
