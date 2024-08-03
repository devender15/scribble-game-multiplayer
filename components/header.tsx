"use client";

import React from "react";
import { useSocket } from "@/providers/socket-provider";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { isConnected } = useSocket();

  return (
    <header className="w-full h-20 py-3 px-5 border flex justify-between items-center bg-pink-300/10">
      <h1>drawit</h1>

      <div>
        <Badge
          className={`${
            isConnected ? "bg-green-500" : "bg-red-500"
          } transition duration-200`}
        >
          {isConnected ? "online" : "offline"}
        </Badge>
      </div>
    </header>
  );
}
