import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Save donation in Supabase
    const { error } = await supabase
      .from("donations")
      .insert([{ amount }]);

    if (error) throw error;

    return NextResponse.json({ message: "Donation recorded successfully!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
  }
}
