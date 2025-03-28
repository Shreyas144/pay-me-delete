import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, amount, message } = body;

    if (!username || !amount) {
      return NextResponse.json({ error: "Username and amount are required." }, { status: 400 });
    }

    // Fetch current bid price
    const { data: bidData, error: bidError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "current_bid")
      .single();

    if (bidError || !bidData) {
      console.error("Error fetching bid price:", bidError);
      return NextResponse.json({ error: "Failed to fetch current bid" }, { status: 500 });
    }

    const currentBid = bidData.value;

    if (amount < currentBid) {
      return NextResponse.json({ error: `Bid must be at least $${currentBid}` }, { status: 400 });
    }

    // Insert new bid (using admin client)
    const { error: insertError } = await supabaseAdmin
      .from("leaderboard")
      .insert([{ username, amount_spent: amount, message }]);

    if (insertError) {
      console.error("Error inserting bid:", insertError);
      return NextResponse.json({ error: "Failed to place bid" }, { status: 500 });
    }

    // Update bid price (using admin client)
    const newBidPrice = Math.floor(amount * 1.5);
    const { error: updateError } = await supabaseAdmin
      .from("settings")
      .update({ value: newBidPrice })
      .eq("key", "current_bid");

    if (updateError) {
      console.error("Error updating bid price:", updateError);
      return NextResponse.json({ error: "Failed to update bid price" }, { status: 500 });
    }

    return NextResponse.json({ message: "Bid placed successfully!", newBidPrice }, { status: 200 });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
