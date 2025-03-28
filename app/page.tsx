"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function DeleteWebsite() {
  const initialPrice = 100; // Starting price in USD
  const increaseRate = 1.2; // Price increases by 20% when timer runs out
  const timeLimit = 60; // Countdown time in seconds

  const deadline = new Date("2025-03-30T00:00:00Z").getTime(); // Set a fixed future deadline

  const [price, setPrice] = useState(initialPrice);
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState(0);
  const [donated, setDonated] = useState(0);
  
  // Fetch the initial total donation from Supabase
  useEffect(() => {
    const fetchDonations = async () => {
      const { data, error } = await supabase.from("donations").select("amount");

      if (error) {
        console.error("Error fetching donations:", error);
      } else {
        const total = data.reduce((sum, donation) => sum + donation.amount, 0);
        setDonated(total);
      }
    };

    fetchDonations();

    // Listen for real-time donation updates
    const subscription = supabase
      .channel("donations")
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, fetchDonations)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Calculate time remaining based on the fixed deadline
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));

      setTimer(remaining);

      if (remaining === 0) {
        setPrice((prev) => Math.ceil(prev * increaseRate)); // Increase price
        setProgress(0);
        setDonated(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle fixed donation
  const handleFixedDonate = async () => {
    await handleDonate(2); // Fixed donation of $2
  };

  // Handle custom donation
  const handleCustomDonate = async () => {
    const customAmount = parseFloat(prompt("Enter donation amount:") || "0");
    if (customAmount > 0) {
      await handleDonate(customAmount);
    }
  };

  // Send donation to backend
  const handleDonate = async (amount: number) => {
    const response = await fetch("/api/donate", {
      method: "POST",
      body: JSON.stringify({ amount }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (response.ok) {
      setDonated(data.totalDonated); // Update UI instantly
      setProgress((data.totalDonated / price) * 100);
    } else {
      alert("Failed to donate: " + data.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="p-6 max-w-lg text-center bg-gray-800 border border-gray-700 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Pay Me to Delete This Website</h1>
        <p className="text-lg mb-2">Current Price: <span className="font-bold">${price}</span></p>
        <p className="text-sm text-gray-400 mb-4">Time Left: {timer}s</p>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm mb-4">${donated} of ${price} collected</p>
        {donated >= price ? (
          <p className="text-xl font-bold text-green-500">Goal Reached!</p>
        ) : (
          <>
            <motion.div whileTap={{ scale: 0.9 }}>
              <button
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg mb-2"
                onClick={handleFixedDonate}
              >
                Donate $2
              </button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                onClick={handleCustomDonate}
              >
                Donate Custom Amount
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
