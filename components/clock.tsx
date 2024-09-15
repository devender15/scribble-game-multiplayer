"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface CountdownClockProps {
  totalSeconds: number;
}

export default function CountdownClock({
  totalSeconds = 60,
}: CountdownClockProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const controls = useAnimation();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      controls.start({
        rotate: [0, 360],
        scale: [1, 0.8, 1],
        transition: { duration: 1, ease: "easeInOut" },
      });
    }
  }, [timeLeft, totalSeconds, controls]);

  const progress = 1 - timeLeft / totalSeconds;
  const isLessThan10Seconds = timeLeft < 10;

  const gradientId = isLessThan10Seconds ? "redGradient" : "coolGradient";
  const strokeColor = `url(#${gradientId})`;

  return (
    <div className="flex items-center justify-center w-12 h-12">
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={controls}
      >
        <defs>
          <linearGradient id="coolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
        />

        <motion.path
          d={`
            M 50 5
            A 45 45 0 ${progress > 0.5 ? 1 : 0} 1 ${
            50 + 45 * Math.sin(2 * Math.PI * progress)
          } ${50 - 45 * Math.cos(2 * Math.PI * progress)}
          `}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-4xl font-bold fill-primary"
        >
          {timeLeft}
        </text>
      </motion.svg>
    </div>
  );
}
