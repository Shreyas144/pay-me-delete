import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body || typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Insert new donation into Supabase
    const { error } = await supabase.from("donations").insert([{ amount: body.amount }]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw new Error(error.message);
    }

    // Get the updated total amount donated
    const { data, error: fetchError } = await supabase
      .from("donations")
      .select("amount");

    if (fetchError) {
      console.error("Supabase Fetch Error:", fetchError);
      throw new Error(fetchError.message);
    }

    const totalDonated = data.reduce((sum, donation) => sum + donation.amount, 0);

    return NextResponse.json({ message: "Donation recorded!", totalDonated }, { status: 200 });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
  }
}
