import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "@prisma/client";
import fetchRoomUsers from "@/actions/fetch-room-users";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function handleFetchRoomUsers(
  roomCode: string,
  setRoomUsers: (users: User[]) => void
) {
  try {
    const roomUsers = await fetchRoomUsers(roomCode);
    setRoomUsers(roomUsers);

    return roomUsers;
  } catch (error) {
    console.error(error);

    return [];
  }
}
