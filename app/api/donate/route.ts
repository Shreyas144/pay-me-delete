import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // 🛠️ Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 🛠️ Insert donation into Supabase
    const { data, error } = await supabase
      .from("donations")
      .insert([{ amount }])
      .select();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
    }

    // 🛠️ Fetch total donations to update frontend
    const { data: totalData, error: totalError } = await supabase
      .from("donations")
      .select("amount");

    if (totalError) {
      console.error("Supabase Fetch Error:", totalError);
      return NextResponse.json({ error: "Failed to fetch updated total" }, { status: 500 });
    }

    const totalDonated = totalData.reduce((sum, donation) => sum + donation.amount, 0);

    return NextResponse.json({ message: "Donation recorded successfully!", totalDonated }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
