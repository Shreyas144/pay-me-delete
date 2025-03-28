import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: leaderboard, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("amount_spent", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });

  return NextResponse.json(leaderboard);
}
