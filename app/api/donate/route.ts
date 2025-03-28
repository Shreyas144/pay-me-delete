import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Use admin client

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    // 🛠️ Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 🛠️ Insert donation into Supabase (use `supabaseAdmin`)
    const { error: insertError } = await supabaseAdmin
      .from("donations")
      .insert([{ amount }]);

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
    }

    // 🛠️ Fetch total donations to update frontend
    const { data: totalData, error: totalError } = await supabaseAdmin
      .from("donations")
      .select("amount");

    if (totalError) {
      console.error("Supabase Fetch Error:", totalError);
      return NextResponse.json({ error: "Failed to fetch updated total" }, { status: 500 });
    }

    // ✅ Ensure `totalData` is an array before reducing
    const totalDonated = totalData?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0;

    return NextResponse.json({ message: "Donation recorded successfully!", totalDonated }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
