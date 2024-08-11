"use client";

import React from "react";
import { useSocket } from "@/providers/socket-provider";
import { Badge } from "@/components/ui/badge";

import { useUserStore } from "@/stores/user-store";

export default function Header() {
  const { isConnected } = useSocket();

  const { name } = useUserStore();

  return (
    <header className="w-full h-20 py-3 px-5 border flex justify-between items-center bg-pink-300/10">
      <h1>drawit</h1>

      {name && <p className="text-sm text-gray-500">Hello, {name}</p>}

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
