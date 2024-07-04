"use client";

import CustomizePlayer from "./customize-player";

export default function GameMode() {
  return (
    <div className="w-full h-full space-y-3">
      <CustomizePlayer />
      <div className="flex gap-x-4 items-center w-full h-full">
        <aside className="basis-1/2 border flex justify-center items-center h-full">
          <button className="w-full">join a random game</button>
        </aside>
        <aside className="basis-1/2 border flex justify-center items-center h-full">
          <button className="w-full">create a new room</button>
        </aside>
      </div>
    </div>
  );
}
