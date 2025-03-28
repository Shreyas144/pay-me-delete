import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { username, amount, message } = await req.json();

    // Fetch current bid price
    const { data: bidData, error: bidError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "current_bid")
      .single();

    if (bidError || !bidData) {
      return NextResponse.json({ error: "Failed to fetch current bid" }, { status: 500 });
    }

    const currentBid = bidData.value;

    if (amount < currentBid) {
      return NextResponse.json({ error: `Bid must be at least $${currentBid}` }, { status: 400 });
    }

    // Insert new bid
    await supabase.from("leaderboard").insert([{ username, amount_spent: amount, message }]);

    // Update bid price (using admin client)
    const newBidPrice = Math.floor(amount * 1.5);
    await supabaseAdmin.from("settings").update({ value: newBidPrice }).eq("key", "current_bid");

    return NextResponse.json({ message: "Bid placed successfully!", newBidPrice }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
