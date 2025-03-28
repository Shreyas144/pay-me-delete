"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LeaderboardEntry = {
  username: string;
  amount_spent: number;
  message: string;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentBid, setCurrentBid] = useState(1);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch leaderboard & bid price
  const fetchLeaderboard = async () => {
    const res = await fetch("/api/leaderboard");
    const data: LeaderboardEntry[] = await res.json();
    setLeaderboard(data);
  };

  const fetchBidPrice = async () => {
    const res = await supabase
      .from("settings")
      .select("value")
      .eq("key", "current_bid")
      .single();

    if (res.data) {
      setCurrentBid(res.data.value);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchBidPrice();
  }, []);

  // Handle bidding
  const placeBid = async () => {
    setError("");

    if (!username || !amount) {
      setError("Please enter a username and amount.");
      return;
    }

    const res = await fetch("/api/bid", {
      method: "POST",
      body: JSON.stringify({ username, amount: Number(amount), message }),
    });

    const data = await res.json();

    if (res.ok) {
      fetchLeaderboard();
      fetchBidPrice();
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">🔥 Auction-Style Leaderboard</h1>

      <div className="bg-gray-800 text-white p-4 rounded-md mb-4">
        <h2 className="text-xl">Current Top Bid: ${currentBid}</h2>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded-md w-full mb-2"
        />
        <input
          type="number"
          placeholder="Bid Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded-md w-full mb-2"
        />
        <input
          type="text"
          placeholder="Trash-Talk Message (Optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 border rounded-md w-full mb-2"
        />
        <button
          onClick={placeBid}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Place Bid
        </button>
      </div>

      <h2 className="text-xl font-bold mb-2">🏆 Leaderboard</h2>
      <ul className="list-none">
        {leaderboard.map((entry, index) => (
          <li key={index} className="p-2 border-b">
            <strong>{entry.username}</strong> - ${entry.amount_spent}
            <p className="text-sm italic">{entry.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
