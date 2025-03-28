"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DeleteWebsite() {
  const initialPrice = 100; // Initial price in USD
  const increaseRate = 1.2; // Price increases by 20% if time runs out
  const timeLimit = 60; // Countdown time in seconds
  const expirationTimestamp = 1712000000; // Set a fixed future timestamp (UTC Epoch)

  const [price, setPrice] = useState(initialPrice);
  const [timer, setTimer] = useState(timeLimit);
  const [progress, setProgress] = useState(0);
  const [donated, setDonated] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current UTC time from API
    const fetchTime = async () => {
      try {
        const response = await fetch("http://worldtimeapi.org/api/timezone/Etc/UTC");
        const data = await response.json();
        const currentTime = Math.floor(new Date(data.utc_datetime).getTime() / 1000); // Convert to seconds
        const remainingTime = expirationTimestamp - currentTime;

        if (remainingTime > 0) {
          setTimer(remainingTime);
        } else {
          handlePriceIncrease();
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch time:", error);
        setLoading(false);
      }
    };

    fetchTime();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      handlePriceIncrease();
    }
  }, [timer]);

  const handlePriceIncrease = () => {
    setPrice((prev) => Math.ceil(prev * increaseRate)); // Increase price
    setTimer(timeLimit); // Reset timer
    setProgress(0); // Reset progress
    setDonated(0); // Reset donations
  };

  const handleDonate = () => {
    const donation = 10; // Fixed donation amount
    setDonated((prev) => prev + donation);
    setProgress(((donated + donation) / price) * 100);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

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
        <motion.div whileTap={{ scale: 0.9 }}>
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
            onClick={handleDonate}
          >
            Donate $10 to Delete
          </button>
        </motion.div>
      </div>
    </div>
  );
}
