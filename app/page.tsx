"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function DeleteWebsite() {
  const initialPrice = 100;
  const increaseRate = 1.2;
  const deadline = new Date("2025-04-01T00:00:00Z").getTime();

  const [price, setPrice] = useState(initialPrice);
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState(0);
  const [donated, setDonated] = useState(0);
  const [customAmount, setCustomAmount] = useState("");

  // Fetch total donations from Supabase
  useEffect(() => {
    const fetchDonations = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("amount");

      if (!error && data) {
        const totalDonated = data.reduce((sum, entry) => sum + entry.amount, 0);
        setDonated(totalDonated);
        setProgress((totalDonated / price) * 100);
      }
    };

    fetchDonations();
    const interval = setInterval(fetchDonations, 5000); // Auto-refresh every 5 seconds

    return () => clearInterval(interval);
  }, [price]);

  // Fetch current time and update countdown
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
        const data = await response.json();
        const currentTime = new Date(data.utc_datetime).getTime();
        let timeLeft = Math.max((deadline - currentTime) / 1000, 0);

        if (timeLeft <= 0) {
          timeLeft = 60;
          setPrice((prev) => Math.ceil(prev * increaseRate));
          setProgress(0);
        }

        setTimer(Math.floor(timeLeft));
      } catch (error) {
        console.error("Error fetching time:", error);
      }
    };

    fetchTime();
    const interval = setInterval(fetchTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  // Handle donation (Fixed $2 or Custom)
  const handleDonate = async (amount: number) => {
    if (amount <= 0) return;

    // Send donation to backend
    const response = await fetch("/api/donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (response.ok) {
      setDonated((prev) => prev + amount);
      setProgress(((donated + amount) / price) * 100);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="p-6 max-w-lg text-center bg-gray-800 border border-gray-700 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Pay Me to Delete This Website</h1>
        <p className="text-lg mb-2">Current Price: <span className="font-bold">${price}</span></p>
        <p className="text-sm text-gray-400 mb-4">Time Left: {timer}s</p>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-red-500 transition-all" style={{ width: `${progress}%` }}></div>
        </div>

        <p className="text-sm mb-4">
          {donated >= price ? "🎉 Amount Reached! Website Will Be Deleted!" : `$${donated} of $${price} collected`}
        </p>

        {/* Fixed $2 Donation */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg mb-2"
            onClick={() => handleDonate(2)}>
            Donate $2
          </button>
        </motion.div>

        {/* Custom Donation */}
        <input
          type="number"
          className="w-full p-2 bg-gray-700 text-white rounded-lg mb-2 text-center"
          placeholder="Enter amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
        />
        <motion.div whileTap={{ scale: 0.9 }}>
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
            onClick={() => handleDonate(Number(customAmount))}
          >
            Donate Custom Amount
          </button>
        </motion.div>
      </div>
    </div>
  );
}
